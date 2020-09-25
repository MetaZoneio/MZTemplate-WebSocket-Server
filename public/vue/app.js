var Access = {
  data() {
    return {
      ADMIN_LEVEL: 9,
      COMPANY_NAME: 'Meta Zone',
      COMPANY_URL: 'https://metazone.io',
      COMPANY_LOGO: 'ttps://metazone-webapp.s3.us-east-2.amazonaws.com/images/MetaZone-Logo-Stacked.png',
    }
  },
  methods: {
    getLocalStorage(key) {
      if(localStorage[key])
        return localStorage[key];
      else
        return ''
    },
    setLocalStorage(key, value) {
      localStorage[key] = value;
    },
    clearLocalStorage(keys) {
      for(let key in keys)
        localStorage[keys[key]] = '';
    }
  }
}


const Home = Vue.component('Home', {
  template: `
    <div>

      <div class="cent">

        {{ serverTime }}

        <canvas ref="canvas" width="600" height="400" style="border:1px solid #fff;"></canvas>

        PLAYERS
        <div class="tbl tbl-list full">
        <div class="tbl-labels">
          <div class="tbl-cell cent">#</div>
          <div class="tbl-cell cent">DCL NAME</div>
          <div class="tbl-cell cent">LVL</div>
          <div class="tbl-cell cent">HP</div>
          <div class="tbl-cell cent">EXP</div>
          <div class="tbl-cell cent">STAMINA</div>
          <div class="tbl-cell cent">EQUIP</div>
          <div class="tbl-cell cent">AMMO</div>
          <div class="tbl-cell cent">FIRE</div>
          <div class="tbl-cell cent">RELOAD</div>
        </div>
        <div class="tbl-row" v-for="(player,index) in players">
          <div class="tbl-cell cent">{{ index }}</div>
          <div class="tbl-cell cent">{{ player.name }}</div>
          <div class="tbl-cell cent">{{ player.lvl }}</div>
          <div class="tbl-cell cent">{{ player.health+'/'+player.hpMax }}</div>
          <div class="tbl-cell cent">{{ player.exp+'/'+player.expNext }}</div>
          <div class="tbl-cell cent">{{ player.stamina.toFixed(1).replace('.0','')+'/'+player.staminaMax }}</div>
          <div class="tbl-cell cent">{{ player.harness[player.equip].id }}</div>
          <div class="tbl-cell cent">{{ player.harness[player.equip].ammo+'/'+player.harness[player.equip].ammoC+' '+player.harness[player.equip].ammoT }}</div>
          <div class="tbl-cell cent">{{ player.fire }}</div>
          <div class="tbl-cell cent">{{ player.reload }}</div>
        </div>
        </div>

      </div>

    </div>
  `,
  mixins: [Access],
  props: ['user'],
  data() {
    return {
      ws: null,
      serverTime: '',
      mouse: {
        plot: '-142,-116',
        name: 'Admin-'+Math.floor(Math.random() * 999999),
        x: 0,
        y: 0,
        a: 0
      },
      players: [],
      enemies: [],
      estateWidth: 16,
      estateHeight: 16,
      scale: 10,
      offsetX: 0,
      offsetY: 0
    }
  },
  mounted() {
    // Retrieve host
    this.refresh();
    // Retrieve 2d canvas
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    // On mouse move
    this.canvas.addEventListener('mousemove', (evt) => {
      var canvasArea = this.canvas.getBoundingClientRect();
      this.mouse.x = ((evt.clientX - canvasArea.left - this.offsetX) / this.scale);
      this.mouse.y = this.estateHeight - ((evt.clientY - canvasArea.top - this.offsetY) / this.scale);
      this.ws.send(JSON.stringify({
        'action': 'updatePlayer',
        'data': this.mouse
      }));
    }, false);
  },
  methods: {
    refresh() {
      // Start websocket client
      var HOST = location.origin.replace(/^http/, 'ws')
      console.log('Attempt Connect: ',HOST);
      this.ws = new WebSocket(HOST);
      // Listen for websocket broadcast
      this.ws.onmessage = this.readWebsocketBroadcast;
    },
    readWebsocketBroadcast(event) {
      // Update server players
      const data = JSON.parse(event.data);
      this.players = data.players;
      this.enemies = data.enemies;
      this.updateCanvas();
    },
    updateCanvas() {
      // Clear the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Center then adjust to estate size
      this.estateWidth = 16;
      this.estateHeight = 16;
      this.scale = 10;
      this.offsetX = this.canvas.width/2 - (this.estateWidth * this.scale / 2);
      this.offsetY = this.canvas.height/2 - (this.estateHeight * this.scale / 2);

      // Estate parcel block
      this.ctx.fillStyle = 'rgba(0,0,0)';
      this.ctx.fillRect(this.offsetX, this.offsetY, this.estateWidth * this.scale, this.estateHeight * this.scale);

      let width = 1;
      let height = 1;
      // Save context in order to easily restore
      this.ctx.save();
      // Reposition the rectangle
      this.ctx.translate(this.offsetX + this.mouse.x * this.scale, this.offsetY + (this.estateHeight * this.scale) - (this.mouse.y * this.scale));
      this.ctx.rotate(this.mouse.a * Math.PI/180);
      // Draw the rectangle
      this.ctx.fillStyle = 'rgba(0,255,0)';
      this.ctx.fillRect(-(width/2) * this.scale, -(height/2) * this.scale, width * this.scale, height * this.scale);
      // Highlight the selected rectangle
      this.ctx.strokeStyle = 'rgba(0,0,255)';
      this.ctx.strokeRect(-(width/2) * this.scale, -(height/2) * this.scale, width * this.scale - 1, height * this.scale - 1)
      // Restore the unrotated context
      this.ctx.restore();

      // Loop through each players
      this.ctx.fillStyle = 'rgba(255,255,255)';
      for(let i=0; i<this.players.length; i++) {
        let name = this.players[i].name;
        let posX = this.players[i].x;
        let posY = this.players[i].y;
        let rotate = this.players[i].ry;
        let kills = this.players[i].kills;
        width = 1;
        height = 1;

        // Save context state to easily restore
        this.ctx.save();
        // Reposition the rectangle
        this.ctx.translate(this.offsetX + posX * this.scale, this.offsetY + (this.estateHeight * this.scale) - (posY * this.scale));
        // Draw text name
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(name+' '+kills, 0, -15);
        // Rotate towards direction
        this.ctx.rotate(rotate * Math.PI/180);
        // Draw the rectangle
        this.ctx.fillRect(-(width/2) * this.scale, -(height/2) * this.scale, width * this.scale, height * this.scale);
        // Restore the original context state
        this.ctx.restore();
      }

      // Loop through each enemies
      this.ctx.fillStyle = 'rgba(0,100,0)';
      for(let i=0; i<this.enemies.length; i++) {
        // Skip if enemy is dead
        if(this.enemies[i].health <= 0)
          continue;

        let name = this.enemies[i].name;
        let posX = this.enemies[i].x;
        let posY = this.enemies[i].y;
        let rotate = this.enemies[i].a;
        width = 1;
        height = 1;

        // Save context state to easily restore
        this.ctx.save();
        // Reposition the rectangle
        this.ctx.translate(this.offsetX + posX * this.scale, this.offsetY + (this.estateHeight * this.scale) - (posY * this.scale));
        // Draw text name
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(name, 0, -15);
        // Rotate towards direction
        this.ctx.rotate(rotate * Math.PI/180);
        // Draw the rectangle
        this.ctx.fillRect(-(width/2) * this.scale, -(height/2) * this.scale, width * this.scale, height * this.scale);
        // Restore the original context state
        this.ctx.restore();
      }
    },
    onChange() {
      this.updateCanvas();
    }
  }
})

const App = Vue.component('App', {
  template: `
    <div>
      <router-view :user="user"></router-view>
    </div>
  `,
  mixins: [Access,MZAPI],
  data() {
    return {
      user: {
        access_id: '',
        access_token: '',
        display_name: '',
        access_level: 0,
        eth_address: ''
      }
    }
  },
  created() {
    this.user.access_id = this.getLocalStorage('access_id');
    this.user.access_token = this.getLocalStorage('access_token');
    this.user.display_name = this.getLocalStorage('display_name');
    this.user.access_level = this.getLocalStorage('access_level');
    this.user.eth_address = this.getLocalStorage('eth_address');
  },
  methods: {
    saveUser(data) {
      if(data.access_id) {
        this.user.access_id = data.access_id;
        this.setLocalStorage('access_id',this.user.access_id)
      }
      if(data.access_token) {
        this.user.access_token = data.access_token;
        this.setLocalStorage('access_token',this.user.access_token)
      }
      if(data.name) {
        this.user.display_name = data.name;
        this.setLocalStorage('display_name',this.user.display_name)
      }
      if(data.access_level) {
        this.user.access_level = data.access_level;
        this.setLocalStorage('access_level',this.user.access_level)
      }
      if(data.eth_address) {
        this.user.eth_address = data.eth_address;
        this.setLocalStorage('eth_address',this.user.eth_address)
      }
    },
    logoutUser(callback) {
      // Show loading animation
      this.$emit('loading', 'SIGNING OUT');
      // Send logout user
      this.postAPI('/user/logout', {}, () => {
        // Hide loading animation
        this.$emit('loading', '');

        this.user.access_id = '';
        this.user.access_token = '';
        this.user.display_name = '';
        this.user.access_level = 0;
        this.user.eth_address = '';
        this.clearLocalStorage(['access_id','access_token','display_name','access_level','eth_address']);

        if(callback)
          callback();
      })
    },
    confirmUser(callback) {
      // Show loading animation
      this.$emit('loading', 'PROCESSING');
      // Send confirm user
      this.postAPI('/user/confirm', {}, (result) => {
        // Hide loading animation
        this.$emit('loading', '');
        // Save user account
        if(result.data && result.data.access)
          this.saveUser(result.data.access)

        // Check access token valid
        if(!result.success) {
          this.logoutUser(callback);
        }
        // Return result
        if(callback)
          callback();
      });
    }
  }
})

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/app',
      name: 'Home',
      component: Home
    }
  ]
})
