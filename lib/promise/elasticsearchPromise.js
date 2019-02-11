/*
 * @Author: horan 
 * @Date: 2017-07-09 09:45:21 
 * @Last Modified by: horan
 * @Last Modified time: 2019-01-09 11:56:08
 * @Elasticsearch Method
 */

var Promise = require("bluebird");
var elasticsearchPool = require('../pool/elasticsearchPool');
var applicationConstants = require('./../../applicationConstants.json');

var queryByIndex = function (url, esHttpAuth, index, query) {
    return new Promise(function (resolve, reject) {
        elasticsearchPool.getConnection(url, esHttpAuth).then(function (client) {
            client.search({
                index: index,
                size: 10000,
                // body: {
                //     query: query
                // }
            }, function (err, response) {
                if (err) {
                    return reject(err);
                } else if (response.errors) {
                    return resolve([]);
                } else {
                    var hits = response.hits.hits;
                    return resolve(hits);
                }
            });
        }).catch(function (err) {
            return reject(err);
        });
    });
};

var bulkData = function (url, esHttpAuth, bulk) {
    return new Promise(function (resolve, reject) {
        elasticsearchPool.getConnection(url, esHttpAuth).then(function (client) {
            var loopError = null;
            var pageSize = applicationConstants['elasticBulkSize'] * 2;
            var paginationProcess = function(blockStart, data){
                if(blockStart < bulk.length){
                    blockEnd = blockStart + pageSize;
                    if(blockEnd > bulk.length){
                        blockEnd = bulk.length;
                    }
                    data = bulk.slice(blockStart,blockEnd);
                    client.bulk({
                        body: data,
                        timeout: '600000ms'
                    }, function (err, response) {
                        blockStart = blockStart + pageSize;
                        if (err) {
                            console.log("error");
                            loopError = err;
                        }
                        if(blockStart % 500 == 0 ){
                            console.log(">>>>>>>>  Batch is under process, please wait!!!  >>>>>>>>");
                        }
                        paginationProcess(blockStart, bulk);
                    });
                } else {
                    if(loopError){
                        return reject(loopError);
                    }else{
                        console.log(">>>>>>>> Elastic Batch completed!! >>>>>>>>>>>>>");
                        return resolve(true);
                    }
                }
            }
            paginationProcess(0,bulk);
        }).catch(function (err) {
            return reject(err);
        });
    });
};

var bulkDataAndPip = function (url, esHttpAuth, bulk, pipelineName) {
    return new Promise(function (resolve, reject) {
        elasticsearchPool.getConnection(url, esHttpAuth).then(function (client) {
            var loopError = null;
            var pageSize = applicationConstants['elasticBulkSize'] * 2;
            var paginationProcess = function(blockStart, data){
                if(blockStart < bulk.length){
                    blockEnd = blockStart + pageSize;
                    if(blockEnd > bulk.length){
                        blockEnd = bulk.length;
                    }
                    data = bulk.slice(blockStart,blockEnd);
                    client.bulk({
                        body: data,
                        timeout: '600000ms',
                        pipeline: pipelineName
                    }, function (err, response) {
                        blockStart = blockStart + pageSize;
                        if (err) {
                            console.log("error");
                            loopError = err;
                        } 
                        if(blockStart % 500 == 0 ){
                            console.log(">>>>>>>>  Batch is under process, please wait!!!  >>>>>>>>");
                        }
                        paginationProcess(blockStart, bulk);
                    });
                } else {
                    if(loopError){
                        return reject(loopError);
                    }else{
                        console.log(">>>>>>>> Elastic Batch completed!! >>>>>>>>>>>>>");
                        return resolve(true);
                    }
                }
            }
            return paginationProcess(0,bulk);
        }).catch(function (err) {
            return reject(err);
        });
    });
};

var deleteByIndex = function (url, esHttpAuth, index) {
    return new Promise(function (resolve, reject) {
        elasticsearchPool.getConnection(url, esHttpAuth).then(function (client) {
            client.indices.delete({
                index: index
            }, function (err, response) {
                if (err) {
                    return reject(err);
                } else if (response.errors) {
                    return resolve(true);
                } else {
                    return resolve(true);
                }
            });
        }).catch(function (err) {
            return reject(err);
        });
    });
};

var removeDoc = function (url, esHttpAuth, index, type, document_id) {
    return new Promise(function (resolve, reject) {
        elasticsearchPool.getConnection(url, esHttpAuth).then(function (client) {
            client.delete({
                index: index,
                type: type,
                id: document_id
            }, function (err, response) {
                if (err) {
                    return reject(err);
                } else if (response.errors) {
                    return resolve(true);
                } else {
                    return resolve(true);
                }
            });
        });
    });
};

var existDoc = function (url, esHttpAuth, index, type, document_id) {
    var queryStr = "_id:" + document_id;
    return new Promise(function (resolve, reject) {
        elasticsearchPool.getConnection(url, esHttpAuth).then(function (client) {
            client.search({
                index: index,
                type: type,
                q: queryStr
            }, function (err, response) {
                if (err) {
                    return reject(err);
                } else if (response.errors) {
                    return resolve(true);
                } else {
                    var flag = false;
                    var hits = response.hits.hits;
                    if (hits.length > 0) {
                        flag = true;
                    }
                    return resolve(flag);
                }
            });
        });
    });
};

var existEsServer = function (url, esHttpAuth) {
    return new Promise(function (resolve, reject) {
        elasticsearchPool.existEsServer(url, esHttpAuth).then(function (result) {
            return resolve(result);
        }).catch(function (err) {
            return reject(err);
        });
    });
};

module.exports = {
    queryByIndex: queryByIndex,
    bulkData: bulkData,
    bulkDataAndPip: bulkDataAndPip,
    deleteByIndex: deleteByIndex,
    removeDoc: removeDoc,
    existDoc: existDoc,
    existEsServer: existEsServer
};
