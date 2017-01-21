var tableUtil = module.exports;
var myBabyParse = require("babyparse");


// define tables struct...
tableUtil.pTables = {
    t_baseinfo:{
        table:null,
        file:process.cwd()+"/../shared/tables/baseinfo.txt",
        map:null,
        init:function(){
            tableUtil.pTables.t_baseinfo.table = myBabyParse.parseFiles(tableUtil.pTables.t_baseinfo.file,{comments:true});
            tableUtil.pTables.t_baseinfo.map = new Map();
            tableUtil.pTables.t_baseinfo.map.set("index",0);
            tableUtil.pTables.t_baseinfo.map.set("typetext",1);
            tableUtil.pTables.t_baseinfo.map.set("cost",2);
            tableUtil.pTables.t_baseinfo.map.set("inchptime",3);
            tableUtil.pTables.t_baseinfo.map.set("inchpvel",4);
            tableUtil.pTables.t_baseinfo.map.set("inclvltime",5);
            tableUtil.pTables.t_baseinfo.map.set("inclvlvel",6);
            tableUtil.pTables.t_baseinfo.map.set("inclvlrate",7);
            tableUtil.pTables.t_baseinfo.map.set("monsterids",8);
        },
    },
    t_monster:{
        table:null,
        file:process.cwd()+"/../shared/tables/monster.txt",
        map:null,
        init:function(){
            tableUtil.pTables.t_monster.table = myBabyParse.parseFiles(tableUtil.pTables.t_monster.file,{comments:true});
            tableUtil.pTables.t_monster.map = new Map();
            tableUtil.pTables.t_monster.map.set("index",0);
            tableUtil.pTables.t_monster.map.set("name",1);
            tableUtil.pTables.t_monster.map.set("hp",2);
            tableUtil.pTables.t_monster.map.set("award",3);
            tableUtil.pTables.t_monster.map.set("icon",4);
        }
    },
}

// read tables......
if(1)
{
    Object.keys(tableUtil.pTables).forEach(function(key) {
        console.log("keysssssssssss",key,typeof(key));
        tableUtil.pTables[key].init();
    });

    
}

// some func for tables;
tableUtil.getLineById = function(pTableData,nId){
    for (var j=0;j<pTableData.length;j++){
        var element = pTableData[j];
        // maybe all id index is 0
        if(element[0] == nId){
            return element;
        }
    }
    return [];
};

tableUtil.getLineValue = function(pLineData,pTableIndex,sIndexName){
    var nIndex = pTableIndex.get(sIndexName);
    return pLineData[nIndex];
};

tableUtil.getBaseIndexByTypeText = function(sType){
    var pData = tableUtil.pTables.t_baseinfo;
    var typetext_id = pData.map.get("typetext");
    for (var j=0;j<pData.data.length;j++){
        var element = pData.data[j];
        if(element[typetext_id] == sType){
            var index_id = pData.map.get("index");
            return parseInt(element[index_id]);
        }
    }
    return 0;
};

tableUtil.getBaseCostByIndex = function(nIndex){
    var pData = tableUtil.pTables.t_baseinfo;
    var index_id = pData.map.get("index");
    for (var i=0;i<pData.table.data.length;i++){
        var element = pData.table.data[i];
        var nCurIndex = parseInt(element[index_id]);
        if(nCurIndex == nIndex){
            var cost_id = pData.map.get("cost");
            return element[cost_id];
        }
    }
    return 0;
};

tableUtil.getMonsterNameById = function(nId){
    var pData = tableUtil.pTables.t_monster;
    var index_id = pData.map.get("index");
    for (var j=0;j<pData.data.length;j++){
        var element = pData.data[i];
        if(element[index_id] == nId){
            var name_id = pData.map.get("name");
            return element[name_id];
        }
    }
    return "";
};

tableUtil.getMaybeMonsterNamesByBaseIndex = function(nIndex){
    var pBaseinfoData = tableUtil.pTables.t_baseinfo;
    var index_id = pBaseinfoData.map.get("index");
    for (var i=0;i<pBaseinfoData.data.length;i++){
        var element = pBaseinfoData.data[i];
        var nCurIndex = parseInt(element[index_id]);
        if(nCurIndex == nIndex){
            var monsterids_id = pBaseinfoData.map.get("monsterids");
            var strMonsterids = element[monsterids_id];
            var pMonsterIds = strMonsterids.split("#");
            var pMonsterNames = [];
            
            var pMonsterData = tableUtil.pTables.t_monster;
            var mindex_id = pMonsterData.map.get("index");
            var mname_id = pMonsterData.map.get("name");
            pMonsterIds.forEach(function(mm){
                for (var j=0;j<pMonsterData.data.length;j++){
                    if(pMonsterData.data[j][mindex_id] == mm){
                        pMonsterNames.push(pMonsterData.data[j][mname_id]);
                        break;
                    }
                }
            });
            return pMonsterNames;
        }
    }
    return [];  
};

tableUtil.randomOneMonsterByBaseIndex = function(nIndex){
    var pBaseinfoData = tableUtil.pTables.t_baseinfo;
    var pMonsterData = tableUtil.pTables.t_monster;
    var index_id = pBaseinfoData.map.get("index");
    var monsterids_id = pBaseinfoData.map.get("monsterids");
    var mindex_id = pMonsterData.map.get("index");
    
    for (var i=0;i<pBaseinfoData.data.length;i++){
        var element = pBaseinfoData.data[i];
        var nCurIndex = parseInt(element[index_id]);
        if(nCurIndex == nIndex){
            var strMonsterids = element[monsterids_id];
            var pMonsterIds = strMonsterids.split("#");
            
            var nRandomIndex = Math.floor(Math.random() * pMonsterIds.length);          
            var nRandomMonsterIndex = pMonsterIds[nRandomIndex];
            for (var j=0;j<pMonsterData.data.length;j++){
                if(pMonsterData.data[j][mindex_id] == nRandomMonsterIndex){   
                    return {
                        id:nRandomMonsterIndex,
                        name:pMonsterData.data[j][t_monster.get("name")],
                        hp:pMonsterData.data[j][t_monster.get("hp")],
                        award:pMonsterData.data[j][t_monster.get("award")],
                        icon:pMonsterData.data[j][t_monster.get("icon")]
                    };
                }
            }
        }
    }
    return {};  
};
