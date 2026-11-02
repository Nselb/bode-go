# BodeGo - Spec

## Problem

Small businesses with one or more warehouses can't
tell how much stock they have of each product or
where it is. They promise items they don't have,
take too long to confirm availability and lose
customers.

## Goals

- A seller can answer "Do we have it, how
  many and where?" in under a second.
- Every stock change is traceable to a user,
  a date, and a reason.
- Stock never goes negative, even with
  simultaneous outbound movements.
- A new company can set up its first warehouse
  and products in under 10 minutes.

## Outside MVP

- Invoicing, purchasing from suppliers, accounting.
- Lots, serial numbers and expiration dates.
- Native mobile apps.
- Barcode scanner hardware.

## Users and roles

A user can hold several roles at once. Each role
assignment is scoped either to one warehouse or
to the whole company. A user's permissions are
the union of all their assignments. The code always
checks permissions, never role names.

| Permission           | Description                             | Admin | Warehouse clerk | Seller |
| -------------------- | --------------------------------------- | ----- | --------------- | ------ |
| `user:manage`        | Manage users and role assignments.      | yes   | no              | no     |
| `warehouse:manage`   | Create and edit warehouses              | yes   | no              | no     |
| `product:manage`     | Create and edit products                | yes   | no              | no     |
| `movement:create`    | Register inbound, outbound, adjustments | yes   | yes             | no     |
| `transfer:manage`    | Create and receive transfers            | yes   | yes             | no     |
| `stock:read`         | Check availability                      | yes   | yes             | yes    |
| `stock:alert`        | Receive low-stock alerts                | yes   | yes             | no     |
| `reservation:create` | Reserve stock for an order              | yes   | no              | yes    |
| `adjustment:approve` | Approve adjustments above the threshold | yes   | no              | no     |
| `audit:read`         | View the audit log                      | yes   | no              | no     |

## Domain model

```mermaid
erDiagram
  COMPANY ||--o{ USER : has
  COMPANY ||--o{ WAREHOUSE : owns
  COMPANY ||--o{ PRODUCT : sells
  USER ||--o{ ROLE_ASSIGNMENT : has
  ROLE ||--o{ ROLE_ASSIGNMENT : "granted as"
  WAREHOUSE |o--o{ ROLE_ASSIGNMENT : "scoped to"
  ROLE ||--o{ ROLE_PERMISSION : includes
  PERMISSION ||--o{ ROLE_PERMISSION : "part of"
  WAREHOUSE ||--o{ STOCK : holds
  PRODUCT ||--o{ STOCK : "stocked as"
  STOCK ||--o{ MOVEMENT : "changed by"
  USER ||--o{ MOVEMENT : performs
  MOVEMENT |o--o| MOVEMENT : reverses
  STOCK ||--o{ RESERVATION : "held by"
  RESERVATION |o--o| MOVEMENT : "fulfilled by"
  WAREHOUSE ||--o{ TRANSFER : "sends"
  WAREHOUSE ||--o{ TRANSFER : "receives"
  PRODUCT ||--o{ TRANSFER : "moved in"
  TRANSFER |o--o{ MOVEMENT : generates
  STOCK ||--o{ ADJUSTMENT_REQUEST : "corrected by"
  USER ||--o{ ADJUSTMENT_REQUEST : requests
  USER |o--o{ ADJUSTMENT_REQUEST : approves
  ADJUSTMENT_REQUEST |o--o| MOVEMENT : "applied as"
```

- **Stock:** on-hand quantity of one product in
  one warehouse, plus its minimum level for low-stock
  alerts (BR-10).
- **Movement:** an immutable record that changes
  on-hand stock. Types: inbound, outbound, adjustment.
  A movement can reference the movement it reverses (BR-02).
- **Reservation:** quantity held for a pending
  order. It lowers available stock, not on-hand
  stock. When dispatched it points to the outbound
  movement that fulfilled it.
- **Transfer:** moves one product between two warehouses
  of the same company. Sending creates an outbound movement
  at the source; receiving creates an inbound movement at
  the destination (BR-04).
- **Adjustment request:** an adjustment above the company
  threshold waiting for approval (BR-08).
  It doesn't change stock until approved, when it creates
  an adjustment movement. Adjustments within the threshold
  skip the request and become a movement directly.
- **Role assignment:** user + role + warehouse.
  An empty warehouse means the whole company.
- **Company:** holds the adjustment approval threshold (BR-08).

## Business rules

- **BR-01** On-hand stock can never be negative. An outbound
  movement, transfer or negative adjustment larger than available
  stock is rejected.
- **BR-02** Movements are immutable. A mistake is fixed
  with a reversing movement that references the original.
- **BR-03** Available = on-hand − reserved.
- **BR-04** A transfer creates an outbound movement
  at the source when sent and an inbound movement at
  the destination when received.
  Units in transit count in neither warehouse.
- **BR-05** Adjustments require a reason: damage or
  loss (decrease only), or count correction (either direction).
- **BR-06** A reservation expires after 24 h if
  the order isn't dispatched.
- **BR-07** Users only see data from their own company.
- **BR-08** Adjustments whose absolute quantity exceeds a
  company-wide configurable threshold stay pending until
  a user with `adjustment:approve` approves them.
  Nobody can approve their own adjustment.
- **BR-09** Permissions are checked against the warehouse
  involved: a permission granted in one warehouse
  does not apply in another.
- **BR-10** Each product has a configurable minimum stock
  level per warehouse. When a product's stock in a warehouse
  falls below its minimum, an email alert is sent to users
  with `stock:alert` on that warehouse. The alert is sent once
  per crossing and rearms after stock is replenished above
  the minimum.

## Flows

### 1. Seller checks availability and reserves

```mermaid
sequenceDiagram
  actor S as Seller
  actor C as Warehouse clerk
  participant API as BodeGo
  participant J as Expiry job

  S->>API: Check product availability [stock:read]
  API-->>S: Available per warehouse (on-hand - reserved, BR-03)
  S->>API: Reserve qty in warehouse W [reservation:create on W]
  alt qty > available
    API-->>S: Rejected
  else qty <= available
    API-->>S: Reservation ACTIVE (expires in 24h)
    Note over API: No movement. Available drops, on-hand unchanged
  end
  alt Seller releases
    S->>API: Release reservation [reservation:create on W]
    API-->>S: RELEASED, available goes back up
  else Order is dispatched
    C->>API: Dispatch reservation [movement:create on W]
    API-->>C: OUTBOUND movement, reservation FULFILLED
  else 24 h pass without dispatch (BR-06)
    J->>API: Expire reservation
    Note over API: EXPIRED, available goes back up, no movement
  end
```

### 2. Clerk registers an inbound and an outbound

```mermaid
sequenceDiagram
  actor C as Warehouse clerk
  participant API as BodeGo

  C->>API: Register inbound in W [movement:create on W, BR-09]
  API-->>C: INBOUND movement (user, date, reason), on-hand up

  C->>API: Register outbound in W [movement:create on W]
  alt qty > available (BR-01)
    API-->>C: Rejected, stock unchanged
  else qty <= available
    API-->>C: OUTBOUND movement, on-hand down
    opt stock falls below minimum (BR-10)
      API->>API: Send low-stock email (once per crossing)
    end
  end
```

### 3. Transfer between warehouses

```mermaid
sequenceDiagram
  actor A as Clerk at source A
  actor B as Clerk at destination B
  participant API as BodeGo

  A->>API: Send transfer A->B [transfer:manage on A]
  alt qty > available in A (BR-01)
    API-->>A: Rejected
  else
    API-->>A: OUTBOUND movement at A, transfer IN_TRANSIT
    Note over API: Units in transit count in neither warehouse (BR-04)
  end

  B->>API: Receive transfer [transfer:manage on B]
  API-->>B: INBOUND movement at B, transfer RECEIVED
```

### 4. Adjustment above the threshold

```mermaid
sequenceDiagram
  actor C as Warehouse clerk
  actor AD as Admin (another user)
  participant API as BodeGo

  C->>API: Create adjustment with reason [movement:create on W, BR-05]
  alt |qty| <= threshold
    API-->>C: ADJUSTMENT movement applied immediately
  else |qty| > threshold (BR-08)
    API-->>C: Adjustment PENDING, stock unchanged
    AD->>API: Approve [adjustment:approve on W]
    alt approver is the creator
      API-->>AD: Rejected, nobody approves their own adjustment
    else
      API-->>AD: APPROVED, ADJUSTMENT movement applied
      Note over API: Negative adjustment still checks BR-01 at approval time
    end
  end
```
