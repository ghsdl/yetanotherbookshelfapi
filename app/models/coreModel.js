const client = require('../client');

class CoreModel {

    dataValues = {};

    constructor(obj) {
        for (const prop in obj) {
            this.dataValues[prop] = obj[prop];
        }
    };

    set data(values) {
        for (const field of this.constructor.fields) {
            if(values[field]) {
                this.dataValues[field] = values[field];
            }
        }
    };

    static async find(options) {

        const result = await client.query(`SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`); 

        const instanceList = [];

        for (const row of result.rows) {
            instanceList.push(new this(row));
        }

        return instanceList;
    };

    static async findByPk(id) {
        const result = await client.query(`SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`, [id]);

        if (!result.rows[0]) {
            return null;
        }

        return new this(result.rows[0]);
    };

    /* PREPARED QUERY */
    
    /*async insert() {
        
        const preparedQuery = {

            text: `INSERT INTO ${this.constructor.tableName} 
                (${this.constructor.fields}) VALUES 
                (${this.constructor.fields.map((field, fieldIndex) => '$' + (fieldIndex+1))}) RETURNING *`,
            values: this.constructor.fields.map(field => this.dataValues[field])
        };

        const result = await client.query(preparedQuery);
        this.dataValues = result.rows[0];

    };*/

    async insert() {

        const preparedQuery = {

            text: `
                SELECT * FROM add_${this.constructor.tableName} ($1)
            `,
            values: [this.dataValues]
        };

        const result = await client.query(preparedQuery);
        this.dataValues = result.rows[0];
        console.log(this.dataValues);
    }

    async update() {

        const preparedQuery = {

            text: `
                SELECT * FROM update_${this.constructor.tableName}($1)
            `,
            values: [this.dataValues]
        };

        const result = await client.query(preparedQuery);
        this.dataValues = result.rows[0];
        console.log(this.dataValues);
    }

    async delete() {
        
        const preparedQuery = {

            text: `
                SELECT * FROM delete_${this.constructor.tableName}($1)
            `,
            values: [this.dataValues.id]
        };

        await client.query(preparedQuery);

    }
 
}

module.exports = CoreModel;