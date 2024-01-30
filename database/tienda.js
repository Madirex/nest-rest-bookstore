db.createUser({
  user: 'admin',
  pwd: 'adminPassword123',
  roles: [
    {
      role: 'readWrite',
      db: 'BOOKSTORE_DB',
    },
  ],
})

db = db.getSiblingDB('BOOKSTORE_DB')

db.createCollection('pedidos')