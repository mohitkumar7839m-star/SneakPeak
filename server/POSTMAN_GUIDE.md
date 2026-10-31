# SneakPeak API Guide for Postman and Frontend

This guide documents the routes currently mounted by the Express server. Use
the exact paths below when creating Postman requests or calling the API from
the frontend.

## 1. Environment and request setup

Create a Postman environment with:

| Variable | Example | Description |
| --- | --- | --- |
| `baseUrl` | `http://localhost:5000` | Backend origin; do not add a trailing slash |
| `productId` | `64f1234567890abcdef12345` | A real product MongoDB ID |
| `adminToken` | Set from your existing login flow | JWT for a user with `role: "admin"` |

For JSON requests, use these headers:

| Header | Value |
| --- | --- |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `Authorization` | `Bearer <adminToken>` (protected endpoints only) |

In Postman, select **Authorization → Bearer Token** and enter `{{adminToken}}`.
Do not include the word `Bearer` in the token field when using that setting.
The backend already verifies JWTs; this API guide does not add or replace login
or registration endpoints.

### Authentication levels

- **Public:** no token required.
- **JWT + admin:** a valid, unexpired JWT is required, and its decoded
  `role` claim must be exactly `"admin"`.
- Missing/invalid token returns `401`; a valid non-admin token returns `403`.

## 2. Endpoint directory

| Method | URL | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | API health message |
| GET | `/api/products/all` | Public | Product list, filtering, sorting, pagination |
| GET | `/api/products/search?q=nike` | Public | Search name, brand, and category |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | JWT + admin | Create a product |
| PUT | `/api/products/:id` | JWT + admin | Update supplied product fields |
| DELETE | `/api/products/:id` | JWT + admin | Archive a product |
| PATCH | `/api/products/:id/archive` | JWT + admin | Compatibility alias to archive a product |
| PATCH | `/api/products/:id/stock` | JWT + admin | Compatibility stock adjustment endpoint |
| GET | `/api/inventory` | JWT + admin | Inventory for active products |
| GET | `/api/inventory/low-stock` | JWT + admin | Products with size stock from 1 through 5 |
| GET | `/api/inventory/out-of-stock` | JWT + admin | Products with size stock equal to zero |
| GET | `/api/inventory/:id` | JWT + admin | Inventory for one product |
| PUT | `/api/inventory/:id` | JWT + admin | Set stock for one or more listed sizes |
| PATCH | `/api/inventory/:id/stock` | JWT + admin | Increase or decrease stock for one size |

`/api/products` by itself is **not** registered as a list route in the current
router. Use `/api/products/all` to fetch the list.

## 3. Shared response and error formats

Successful responses use JSON and normally include `"success": true`. For
example:

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {}
}
```

Validation and not-found errors use:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Authentication middleware returns these response bodies:

```json
{ "message": "Login required" }
```

```json
{ "message": "Invalid or expired token" }
```

Admin authorization returns:

```json
{
  "success": false,
  "message": "Administrator access required"
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `200` | Request succeeded |
| `201` | Product created |
| `400` | Invalid ID, query parameter, or request body |
| `401` | Missing, invalid, expired token, or missing authenticated user ID |
| `403` | Token is valid but user is not an administrator |
| `404` | Product or requested shoe size was not found |
| `409` | Stock decrease would result in negative inventory |
| `500` | Unexpected database or server error |

## 4. Product APIs

### 4.1 API health

**GET** `{{baseUrl}}/`

- Auth: Public
- Body: none
- Success (`200`):

```json
{
  "message": "SneakPeak API is running"
}
```

### 4.2 List, filter, sort, and paginate products

**GET** `{{baseUrl}}/api/products/all`

- Auth: Public
- Body: none
- Only active products (`isArchived: false`) are returned.
- All query parameters are optional and can be combined.

| Parameter | Type | Example | Behavior |
| --- | --- | --- | --- |
| `brand` | string | `Nike` | Case-insensitive exact brand match |
| `category` | string | `Running` | Case-insensitive exact category match |
| `color` | string | `Black` | Case-insensitive exact color match |
| `minPrice` | number | `1000` | Minimum price, inclusive |
| `maxPrice` | number | `5000` | Maximum price, inclusive |
| `size` | number | `9` | Shoe size; only products with positive stock in that size match |
| `q` | string | `air max` | Case-insensitive partial match in name, brand, or category |
| `sort` | string | `price_asc` | `newest` (default), `price_asc`, `price_desc`, `name_asc` |
| `page` | positive integer | `1` | Page number; default `1` |
| `limit` | positive integer | `10` | Items per page; default `10`, maximum `50` |

Examples:

```http
GET {{baseUrl}}/api/products/all?page=1&limit=10
GET {{baseUrl}}/api/products/all?brand=Nike
GET {{baseUrl}}/api/products/all?category=Running&color=Black
GET {{baseUrl}}/api/products/all?minPrice=1000&maxPrice=5000
GET {{baseUrl}}/api/products/all?size=9&sort=price_asc
GET {{baseUrl}}/api/products/all?q=air%20max&brand=Nike&page=1&limit=10
```

Success (`200`):

```json
{
  "success": true,
  "total": 1,
  "page": 1,
  "pages": 1,
  "products": [
    {
      "_id": "64f1234567890abcdef12345",
      "name": "Air Max 90",
      "brand": "Nike",
      "category": "Running",
      "color": "Black",
      "description": "Everyday running sneakers",
      "images": ["https://example.com/air-max-90.jpg"],
      "sellerId": "64f1234567890abcdef67890",
      "sizes": [
        { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 10 },
        { "_id": "64f1234567890abcdef22222", "size": 10, "price": 7999, "stock": 5 }
      ],
      "isArchived": false,
      "createdAt": "2026-10-30T12:00:00.000Z",
      "updatedAt": "2026-10-30T12:00:00.000Z"
    }
  ]
}
```

Invalid filter, sort, page, or limit returns `400`. For instance, if
`minPrice > maxPrice`, the response message is
`"Minimum price cannot exceed maximum price"`.

### 4.3 Search products

**GET** `{{baseUrl}}/api/products/search?q=nike`

- Auth: Public
- Required query parameter: `q` (non-empty string)
- Searches product name, brand, and category, case-insensitively.
- Supports the same optional filters, sorting, and pagination as the list route.
- Empty or omitted `q` returns `400`.

Example:

```http
GET {{baseUrl}}/api/products/search?q=nike&page=1&limit=10
```

Success (`200`) has the same response shape as **List products** above.

### 4.4 Get a product by ID

**GET** `{{baseUrl}}/api/products/{{productId}}`

- Auth: Public
- Path parameter: `id` must be a 24-character MongoDB ObjectId.
- Body: none

Success (`200`):

```json
{
  "success": true,
  "product": {
    "_id": "64f1234567890abcdef12345",
    "name": "Air Max 90",
    "brand": "Nike",
    "category": "Running",
    "color": "Black",
    "description": "Everyday running sneakers",
    "images": ["https://example.com/air-max-90.jpg"],
    "sellerId": "64f1234567890abcdef67890",
    "sizes": [
      { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 10 }
    ],
    "isArchived": false,
    "createdAt": "2026-10-30T12:00:00.000Z",
    "updatedAt": "2026-10-30T12:00:00.000Z"
  }
}
```

Invalid ID returns `400`; unknown or archived product returns `404`.

### 4.5 Create a product

**POST** `{{baseUrl}}/api/products`

- Auth: JWT + admin
- Headers: `Content-Type: application/json`, `Authorization: Bearer <adminToken>`
- Required fields: `name`, `brand`, `description`, `sizes`
- Optional fields: `images`, `category`, `color`
- `sizes` must contain at least one entry. Each entry requires a positive
  numeric `size`, non-negative numeric `price`, and non-negative integer `stock`.
  Duplicate sizes are rejected.

Request:

```json
{
  "name": "Air Max 90",
  "brand": "Nike",
  "category": "Running",
  "color": "Black",
  "description": "Everyday running sneakers",
  "images": ["https://example.com/air-max-90.jpg"],
  "sizes": [
    { "size": 9, "price": 7999, "stock": 10 },
    { "size": 10, "price": 7999, "stock": 5 }
  ]
}
```

Success (`201`):

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "64f1234567890abcdef12345",
    "name": "Air Max 90",
    "brand": "Nike",
    "category": "Running",
    "color": "Black",
    "description": "Everyday running sneakers",
    "images": ["https://example.com/air-max-90.jpg"],
    "sellerId": "64f1234567890abcdef67890",
    "sizes": [
      { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 10 }
    ],
    "isArchived": false,
    "createdAt": "2026-10-30T12:00:00.000Z",
    "updatedAt": "2026-10-30T12:00:00.000Z"
  }
}
```

Validation failure returns `400`; missing/invalid login token returns `401`;
authenticated non-admin returns `403`.

### 4.6 Update a product

**PUT** `{{baseUrl}}/api/products/{{productId}}`

- Auth: JWT + admin
- Headers: `Content-Type: application/json`, `Authorization: Bearer <adminToken>`
- Only fields supplied in the request are changed (partial-update behavior).
- Accepted fields: `name`, `brand`, `description`, `images`, `sizes`,
  `category`, `color`.

Request example (change price and stock for an existing size):

```json
{
  "sizes": [
    { "size": 9, "price": 8299, "stock": 12 }
  ],
  "color": "White"
}
```

Success (`200`):

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "64f1234567890abcdef12345",
    "name": "Air Max 90",
    "brand": "Nike",
    "category": "Running",
    "color": "White",
    "description": "Everyday running sneakers",
    "images": ["https://example.com/air-max-90.jpg"],
    "sellerId": "64f1234567890abcdef67890",
    "sizes": [
      { "_id": "64f1234567890abcdef11111", "size": 9, "price": 8299, "stock": 12 }
    ],
    "isArchived": false,
    "createdAt": "2026-10-30T12:00:00.000Z",
    "updatedAt": "2026-10-30T12:05:00.000Z"
  }
}
```

Invalid ID or body returns `400`; missing/archived product returns `404`.

### 4.7 Delete (archive) a product

**DELETE** `{{baseUrl}}/api/products/{{productId}}`

- Auth: JWT + admin
- Headers: `Authorization: Bearer <adminToken>`
- Body: none
- This is a soft delete: it sets `isArchived` to `true`; it does not physically
  remove the MongoDB document. Archived products do not appear in product or
  inventory listings.

Success (`200`):

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

The compatibility alias **PATCH**
`{{baseUrl}}/api/products/{{productId}}/archive` performs the same operation and
returns the same response.

### 4.8 Compatibility stock endpoint under products

**PATCH** `{{baseUrl}}/api/products/{{productId}}/stock`

- Auth: JWT + admin
- Headers: `Content-Type: application/json`, `Authorization: Bearer <adminToken>`
- This is an alias to the inventory stock-update handler. Prefer
  `/api/inventory/{{productId}}/stock` for new frontend integrations.
- Request body and response are the same as **Adjust stock** in the Inventory
  section below.

## 5. Inventory APIs

Inventory is stored on the product document in `sizes[].stock`; there is no
separate inventory collection. All inventory endpoints require JWT + admin.
Stock must be a non-negative integer, and a stock adjustment cannot reduce it
below zero.

Inventory response item shape:

```json
{
  "productId": "64f1234567890abcdef12345",
  "name": "Air Max 90",
  "brand": "Nike",
  "sizes": [
    { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 8 }
  ]
}
```

### 5.1 Get all inventory

**GET** `{{baseUrl}}/api/inventory`

- Auth: JWT + admin
- Body: none
- Returns inventory for all active products.

Success (`200`):

```json
{
  "success": true,
  "total": 1,
  "inventory": [
    {
      "productId": "64f1234567890abcdef12345",
      "name": "Air Max 90",
      "brand": "Nike",
      "sizes": [
        { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 8 }
      ]
    }
  ]
}
```

### 5.2 Get inventory for one product

**GET** `{{baseUrl}}/api/inventory/{{productId}}`

- Auth: JWT + admin
- Body: none
- Invalid ID returns `400`; missing/archived product returns `404`.

Success (`200`):

```json
{
  "success": true,
  "inventory": {
    "productId": "64f1234567890abcdef12345",
    "name": "Air Max 90",
    "brand": "Nike",
    "sizes": [
      { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 8 }
    ]
  }
}
```

### 5.3 Set stock values

**PUT** `{{baseUrl}}/api/inventory/{{productId}}`

- Auth: JWT + admin
- Headers: `Content-Type: application/json`, `Authorization: Bearer <adminToken>`
- Update one or multiple sizes that are already listed for the product.
- Sizes not included in the request are unchanged.

Request (multiple sizes):

```json
{
  "sizes": [
    { "size": 9, "stock": 12 },
    { "size": 10, "stock": 6 }
  ]
}
```

Request (one size):

```json
{
  "size": 9,
  "stock": 12
}
```

Success (`200`):

```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "inventory": {
    "productId": "64f1234567890abcdef12345",
    "name": "Air Max 90",
    "brand": "Nike",
    "sizes": [
      { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 12 }
    ]
  }
}
```

Invalid stock or unlisted size returns `400`; invalid product ID returns `400`;
missing/archived product returns `404`.

### 5.4 Adjust stock up or down

**PATCH** `{{baseUrl}}/api/inventory/{{productId}}/stock`

- Auth: JWT + admin
- Headers: `Content-Type: application/json`, `Authorization: Bearer <adminToken>`
- Use one of these body formats.

Increase or decrease by a signed integer:

```json
{
  "size": 9,
  "change": -2
}
```

Or specify the operation and a positive quantity:

```json
{
  "size": 9,
  "operation": "increase",
  "quantity": 2
}
```

`operation` may be `"increase"` or `"decrease"`. The endpoint also accepts an
absolute stock value for compatibility:

```json
{
  "size": 9,
  "stock": 12
}
```

Success (`200`):

```json
{
  "success": true,
  "message": "Stock updated successfully",
  "inventory": {
    "productId": "64f1234567890abcdef12345",
    "name": "Air Max 90",
    "brand": "Nike",
    "sizes": [
      { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 8 }
    ]
  }
}
```

Invalid change/size returns `400`; missing product or unlisted size returns
`404`; a decrease that would make stock negative returns `409`:

```json
{
  "success": false,
  "message": "Insufficient stock for this update"
}
```

### 5.5 Get low-stock products

**GET** `{{baseUrl}}/api/inventory/low-stock`

- Auth: JWT + admin
- Body: none
- A size is considered low stock when its stock count is 1 through 5.
- Each returned product includes only its low-stock sizes in `sizes`.

Success (`200`):

```json
{
  "success": true,
  "total": 1,
  "inventory": [
    {
      "productId": "64f1234567890abcdef12345",
      "name": "Air Max 90",
      "brand": "Nike",
      "sizes": [
        { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 3 }
      ]
    }
  ]
}
```

### 5.6 Get out-of-stock products

**GET** `{{baseUrl}}/api/inventory/out-of-stock`

- Auth: JWT + admin
- Body: none
- Each returned product includes only sizes whose stock is exactly `0`.

Success (`200`):

```json
{
  "success": true,
  "total": 1,
  "inventory": [
    {
      "productId": "64f1234567890abcdef12345",
      "name": "Air Max 90",
      "brand": "Nike",
      "sizes": [
        { "_id": "64f1234567890abcdef11111", "size": 9, "price": 7999, "stock": 0 }
      ]
    }
  ]
}
```

## 6. Frontend `fetch` examples

### Public product listing with filters

```js
const params = new URLSearchParams({
  brand: "Nike",
  category: "Running",
  size: "9",
  minPrice: "1000",
  maxPrice: "10000",
  sort: "price_asc",
  page: "1",
  limit: "10"
});

const response = await fetch(
  `${API_BASE_URL}/api/products/all?${params.toString()}`
);
const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || "Unable to load products");
}

// data.products, data.total, data.page, data.pages
```

### Admin product create

```js
const response = await fetch(`${API_BASE_URL}/api/products`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`
  },
  body: JSON.stringify(productPayload)
});

const data = await response.json();
if (!response.ok) {
  throw new Error(data.message || "Unable to create product");
}

// data.product
```

### Admin stock adjustment

```js
const response = await fetch(
  `${API_BASE_URL}/api/inventory/${productId}/stock`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ size: 9, operation: "decrease", quantity: 1 })
  }
);

const data = await response.json();
if (!response.ok) {
  throw new Error(data.message || "Unable to update stock");
}

// data.inventory
```

## 7. Suggested Postman testing order

1. Set `baseUrl` and make **GET** `/` to check the server is reachable.
2. Use **GET** `/api/products/all` to retrieve products and copy a returned
   `_id` into `productId`.
3. Try search, each filter, combined filters, sorting, and pagination.
4. Test **GET** `/api/products/{{productId}}`.
5. Set `adminToken` from the existing admin login flow. Verify protected
   endpoints with (a) no token (`401`), (b) a non-admin token (`403`), and
   (c) an admin token.
6. Create/update a product, then call inventory GET, PUT, and PATCH endpoints.
7. Test a valid decrease and a decrease larger than available stock; the latter
   should return `409` and must not make stock negative.
8. Test low-stock and out-of-stock endpoints after setting size stock values.
