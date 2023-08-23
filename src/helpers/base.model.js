import  DbHelper from './db.helper';
const dbs  = new DbHelper()

class BaseModel  {
  constructor(value) {

    this.tableName = value;
    this.insertion = undefined;
    this.selectCols = undefined;
    this.selectWhere = '';
    this.offsets = 0;
    this.limits = 10;
    this.orderBy = '';
    this.orderIs = '';
    this.updation = undefined;
    this.fileId = undefined;
    this.updateWhere = '';
    this.insertPrimaryKey = undefined;
 

  }

  inserRecords() {
    const query = 'CALL InsertData("' + this.tableName + '","' + this.insertion + '");';
    return dbs.pdo(query, "write");
  }

  getRecords() {
    const query = 'CALL getFile("' + this.fileId + '");';
    return dbs.pdo(query);
  }

  deleteDocsBeforeUpload(kycId) {
    return new Promise((resolve) => {
      this.callQuery(`call deleteDocsBeforeInsert('${kycId}');`).then(
        (res) => resolve(res),
        () => resolve(false)
      );
    });
  }

  deleteRecord(isSelfie = false, userId = '') {
    let query;
    if (isSelfie) {
      query = `CALL deleteSelfie('${this.fileId}','${userId}')`;
      const result = dbs.pdo(query);
      this.fileId = '';
      return result;
    } else {
      query = 'CALL deleteFile("' + this.fileId + '");';
      const result = dbs.pdo(query);
      this.fileId = '';
      return result;
    }
  }

  async selectRecords() {
    const query = 'call SelectData("' +
      this.selectCols +
      '","' +
      this.tableName +
      '","' +
      this.selectWhere +
      '",' +
      this.offsets +
      ',' +
      this.limits +
      ',"' +
      this.orderBy +
      '","' +
      this.orderIs +
      '");';

    const result = await dbs.pdo(query);
    this.resetSelectSettings();
    return result;
  }

  async updateRecords() {
    const query = 'call updateData("' +
      this.tableName +
      '","' +
      this.updation +
      '","' +
      this.updateWhere +
      '");';

    return await dbs.pdo(query);
  }

  async callQuery(query, connType = 'normal') {
    const result = await dbs.pdo(query, connType);
    console.log("chatResult", result);
    this.resetSelectSettings();
    return result;
  }

  resetSelectSettings() {
    this.selectWhere = '';
    this.orderBy = '';
    this.orderIs = '';
    this.selectCols = '';
    this.offsets = 0;
  }
}

export default BaseModel;
