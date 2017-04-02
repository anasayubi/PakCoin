// This helper file conatins a function that translates error objects into 
// meaningful, user-oriented error messages
function translateError(err){
    var message
    if(err === ''){
        message = ''
    }
    else{
        message = "An error occured"
    }
    
    return message
}

module.exports = translateError