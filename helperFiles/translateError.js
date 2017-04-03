// This helper file conatins a function that translates error objects into 
// meaningful, user-oriented error messages
function translateError(err){
    var message
    //console.log('debug')
    //console.log(err.errors)
    if(Object.keys(err.errors).includes('firstName') && err.name === 'ValidationError')
        message = 'First name can only letters, commas, periods, spaces and apostrophes'
    else if(Object.keys(err.errors).includes('lastName') && err.name === 'ValidationError')
        message = 'Last name can only letters, commas, periods, spaces and apostrophes'
    else if(Object.keys(err.errors).includes('username') && err.name === 'ValidationError')
        message = 'Username must at least be 5 characters and can contain letters, numbers, underscores, hyphens and periods'
    else if(Object.keys(err.errors).includes('password') && err.name === 'ValidationError')
        message = 'Password must at least 8 characters and must contain at least 1 number'
    // Default message error
    else
        message = "An error occured"
    
    return message
}

module.exports = translateError