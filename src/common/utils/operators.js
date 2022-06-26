const arr2Id = (arr) => {
    return arr && arr.map(item=>item.id ? item.id : item);
}

const id2Arr = (idArr, arr) => {
    return idArr && idArr.map(id=>{
        let curr = id;
        arr && arr.forEach(item => item.id===id && (curr=item));
        return curr;
    })
}

const union = function (arr1, arr2){
    let mergeArr = arr1 && arr2 && arr1.concat(arr2);
    let _arr1 = arr2Id(arr1);
    let _arr2 = arr2Id(arr2);
    let idArr = [...new Set(_arr1.concat(_arr2))];
    return id2Arr(idArr,mergeArr);
}

const getIntersect = function(a, b){
    if(a.constructor === Array && b.constructor === Array){
        let set1 = new Set(a);
        let set2 = new Set(b);
        return Array.from(new Set([...set1].filter( x => set2.has(x))));
    }
    return null;
}

const getDifference = function(a,b){
    if(a.constructor === Array && b.constructor === Array){
        let set1 = new Set(a);
        let set2 = new Set(b);
        return Array.from(new Set([...set1].filter(x => !set2.has(x))));
    }
    return null;
}

export {union, getIntersect, getDifference};
