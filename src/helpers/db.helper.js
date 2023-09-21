import { createPool } from 'mysql';
import dotenv from 'dotenv'
dotenv.config()

class DbHelper {
  constructor() {
    this.normalPool = this.initializePool('normal');
  }

  initializePool(connectionType) {
    const db =
    {
      connectionLimit: 1,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
    }
    console.log(db)
    return createPool(db);

  }


  pdo(query, conType = 'normal') {
    try{
      console.log("query",query)
      if(query==undefined || query==null || query==''){
        return false;
      }
    let pdoConnect;

    pdoConnect = this.normalPool;


    return new Promise((resolve, reject) => {
      pdoConnect.getConnection((err, connection) => {
        if (err) {
         // console.log(err);
          return reject(err);
        }

        connection.query(query, (error, results) => {
          connection.release();
          if (error) return reject(error);
          const result = results.length > 0 ? JSON.parse(JSON.stringify(results[0])) : [];
          resolve(result);
        });
      });
    });
  }catch(err){
  //  console.log(err)
  }
}

  readOpreation() {
    this.readPool = this.initializePool('read');
  }

  writeOpreation() {
    this.writePool = this.initializePool('read');
  }
}

export default DbHelper;
