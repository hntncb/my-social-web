import pool from "./pool.js";

export const transaction = async (callback) =>{
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;
    }catch(error){
        await client.query("ROLLBACK");
        //console.log(error);
        throw error;
    }finally{
        client.release();
    };
};

const transactionModule = {transaction};

export default transactionModule;