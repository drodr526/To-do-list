exports.getDate = function()
{
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    var today = new Date;
    var todaysDate = today.toLocaleDateString("en-US", options);

    return todaysDate;
}

exports.getDay = function()
{
    const options = {day: 'numeric' };
    var today = new Date;
    var todaysDate = today.toLocaleDateString("en-US", options);

    return todaysDate;
}
    
    