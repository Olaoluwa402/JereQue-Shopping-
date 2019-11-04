const paystack = (request) => {
    const MySecretKey = 'Bearer sk_test_a96841135f0b1bf2db7c2022fc4fb4c017ca8714';
    //sk_test_xxxx to be replaced by your own secret key
    const initializePayment = (form, mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/initialize',
            headers : {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           },
           form
        };
        const callback = (error, response, body)=>{
            return mycallback(error, body); 
        };
        request.post(option,callback);
    };
    const verifyPayment = (ref,mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
            headers : {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           }
        };
        const callback = (error, response, body)=>{
            return mycallback(error, body);
        };
        request(option,callback);
    };
    return {initializePayment, verifyPayment};
};
module.exports = paystack;
