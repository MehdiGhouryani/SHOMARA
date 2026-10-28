# Offline Sync API Contract

## POST /api/v1/sync/batch

Headers:

- `X-Client-Installation-Id` required.

Request:

```json
{
  "actions": [
    {
      "id": "local-action-id",
      "clientInstallationId": "installation-id",
      "learningIdentityId": "learning-id",
      "operationType": "SUBMIT_ATTEMPT",
      "idempotencyKey": "unique-operation-key",
      "payload": {},
      "status": "PENDING",
      "attemptCount": 0,
      "createdAt": "2026-09-24T00:00:00.000Z",
      "updatedAt": "2026-09-24T00:00:00.000Z"
    }
  ]
}
```

Response:

```json
{
  "results": [
    {
      "status": "ACKED",
      "idempotencyKey": "unique-operation-key",
      "response": {}
    }
  ]
}
```

## Result semantics

- `ACKED`: canonical server processing accepted the operation.
- `DUPLICATE`: operation already accepted; client may safely remove local copy.
- `RETRY`: transient condition; keep local action.
- `REJECTED`: permanent contract/auth/content error; keep auditable failure state and do not loop forever.

## Content cache semantics

`CURRENT / NEXT / RECENT / FUTURE` remain a local delivery policy. Cache state is not Learning Truth.
