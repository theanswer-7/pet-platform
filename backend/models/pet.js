// backend/models/Pet.js
const db = require('../config/database');

class Pet {
    static create(petData, callback) {
        const sql = 'INSERT INTO pets SET ?';
        db.query(sql, petData, callback);
    }
    
    static findByOwner(ownerId, callback) {
        const sql = 'SELECT * FROM pets WHERE owner_id = ?';
        db.query(sql, [ownerId], callback);
    }
    
    static findAll(callback) {
        const sql = 'SELECT * FROM pets';
        db.query(sql, callback);
    }
    
    static update(id, petData, callback) {
        const sql = 'UPDATE pets SET ? WHERE id = ?';
        db.query(sql, [petData, id], callback);
    }
    
    static delete(id, callback) {
        const sql = 'DELETE FROM pets WHERE id = ?';
        db.query(sql, [id], callback);
    }
}

module.exports = Pet;