export const AndroidList = {
    "1" : "Android 1.0",
    "2" : "Android 1.1",
    "3" : "Android 1.5",
    "4" : "Android 1.6",
    "5" : "Android 2.0",
    "6" : "Android 2.0.1",
    "7" : "Android 2.1",
    "8" : "Android 2.2",
    "9" : "Android 2.3.1",
    "10" : "Android 2.3.3",
    "11" : "Android 3.0",
    "12" : "Android 3.1",
    "13" : "Android 3.2",
    "14" : "Android 4.0",
    "15" : "Android 4.0.3",
    "16" : "Android 4.1",
    "17" : "Android 4.2",
    "18" : "Android 4.3",
    "19" : "Android 4.4",
    "20" : "Android 4.4W",
    "21" : "Android 5.0",
    "22" : "Android 5.1",
    "23" : "Android 6.0",
    "24" : "Android 7.0",
    "25" : "Android 7.1",
    "26" : "Android 8.0",
    "27" : "Android 8.1",
    "28" : "Android 9.0",
}
String.prototype.startWith = function(str) {
    if(str == null || str == "" || this.length == 0 || str.length > this.length) {
        return false;
    }
    return this.substr(0, str.length) == str;
}
String.prototype.endWith = function(str) {
    if(str == null || str == "" || this.length == 0 || str.length > this.length) {
        return false;
    }
    return this.substring(this.length - str.length) == str;
}