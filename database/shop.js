db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'BOOKSTORE_DB',
    },
  ],
})

db = db.getSiblingDB('BOOKSTORE_DB')

db.createCollection('orders')
