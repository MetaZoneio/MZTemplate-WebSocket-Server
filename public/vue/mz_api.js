var MZAPI = {
  data() {
    return {
      API_URL: 'http://localhost:12000/api', CDN_URL: '/includes',
      //API_URL: 'https://blockrunner.herokuapp.com/api', CDN_URL: 'https://metazone-webapp.s3.us-east-2.amazonaws.com',
    }
  },
  mixins: ['Access'],
  methods: {

    postAPI: function(target, params, callback) {
      console.log('Post API '+target, params);

      // Include access token
      if(this.user)
        params.access_token = this.user.access_token;

  		// Send form data
  		fetch(this.API_URL+target, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
  				method: 'post',
  				body: JSON.stringify(params)
  			})
  			.then(response => {
  				if(response.ok)
  					return response.json();
  				else
  					throw new Error('Something went wrong: '+response.statusText);
  			})
  			.then(result => {
          console.log(result);

          // Send back results
          callback(result);
  			})
  			.catch(error => {
  				console.log(error);

          // Send back failed
          callback({success:false,reason:error});
  			});
    }

  }
}
