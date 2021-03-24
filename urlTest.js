let url = 'mongodb+srv://aaronhalstonlee:Sassdad1@cluster0.vuh29.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
let urlObj = new URL(url);
let clean = url.split('?').shift()
console.log(clean);
