module.exports = function log(action, msg) {
    console.log('   \x1b[36m'+action+'\x1b[0m : ', msg);
};