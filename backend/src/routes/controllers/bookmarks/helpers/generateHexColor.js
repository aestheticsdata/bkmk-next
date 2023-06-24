// generate hex color, see : https://stackoverflow.com/a/5092846/5671836
// and https://stackoverflow.com/questions/12125421/why-does-a-shift-by-0-truncate-the-decimal
module.exports = () => '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
