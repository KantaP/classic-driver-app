export var Global = {
    setGlobal:(key, value)=>{
        Global[key] = value
    },
    getGlobal:(key)=>{
        return Global[key]
    }
}