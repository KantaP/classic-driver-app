/* Walkie Takie Service */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Platform, AlertController } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { MusicControls } from '@ionic-native/music-controls';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Headers, RequestOptions } from '@angular/http'


// ref
// http://licode.readthedocs.io/en/stable/client_api/
declare var Erizo;
declare var cordova: any;
declare var window: any;

var subscribePeerStore = [];
var roomStream;
var localStream;
var localStreamID;
var username;
var privateId;
var isPrivateMode;
var isPublished;
var privateWith;
var privateWithId;
var privateState;
var isCaller;
var rxPrivateCallerTimeout;
var position = 'driver';
var me;
var userId;

@Injectable()
export class PushToTalkService {
  /*
  ##demo server##
  urlServer = 'https://chotis2.dit.upm.es/';
  roomConference = '57ced9e455722d2422eb99ab';
  roomPrivate = '57ced7acb831f12276f1afcc'; 
  ts.voice = '5a69675d1afc2e073ff6b5e0'
  */
  private me = this;
  private urlServer = 'https://ts.voice.ecoachmanager.com/';
  //private urlServer = 'https://chotis2.dit.upm.es/';
  private roomConference = '5a69675d1afc2e073ff6b5e0';
  private roomPrivate = '57ced7acb831f12276f1afcc';


  private token = '';
  private tag = '[WkService.log]';
  private isMuted = false;
  private userSubscrip
  private volume = 1;
  private d;
  rxStreamUpdateListener;
  private rxReconnectRoom;

  private audioPath = 'assets/audio/';
  private audioContext;
  private conState;
  private peerList = [];

  private privateSignalTime;
  private privateSignalCount;

  constructor(private http: Http,
    private plt: Platform,
    private nativeAudio: NativeAudio,
    private musicCtrl: MusicControls,
    private alertCtrl: AlertController
  ) {
    console.log('WkService instace created..:' + Erizo);
  }


  initializeService(room: string, name: string) {

    //username = this.getUsername();
    username = '50';
    userId = username;

    (room == undefined ? this.roomConference = this.roomConference : this.roomConference = room);
    (name == undefined ? true : username = name);
    console.log(this.tag + 'myName : ' + username);

    isPrivateMode = false;
    isPublished = false;
    isCaller = false;
    //privateId = this.getRandom();
    privateId = '014789';

    me = this.me;

    this.initMusicCtrl();
    this.rxStream();
    this.connectRoom();
  }

  //update service status to subscriber.
  rxStream() {
    this.rxStreamUpdateListener = Observable.create(observe => {
      setInterval(() => {
        this.conState = this.stateUpdate(roomStream);
        observe.next(
          {
            name: username,
            conState: this.conState,
            muted: this.isMuted,
            privateMode: isPrivateMode,
            privateState: privateState,
            caller: isCaller,
            privateId: privateId,
            privateWith: privateWith,
            published: isPublished,
            peerList: me.peerList
          }
        )
      }, 1000)
    });
  }

  connectRoom() {
    this.rxReconnectRoom = Observable.timer(100, 5000).subscribe(x => {
      this.initUserMedia();
    });
  }

  private initUserMedia() {

    var streamAttribute = { name: username, privateId: privateId, privateMode: isPrivateMode, position: position, state: this.stateUpdate(roomStream), userId: userId };

    if (this.plt.is('cordova')) {
        localStream = Erizo.Stream({ audio: true, video: false, data: true, attributes: streamAttribute });
        this.getToken();

    } else { // browser
        navigator.getUserMedia({ audio: true, video: false }, stream => {
            localStream = Erizo.Stream({ audio: true, video: false, data: true, attributes: streamAttribute });
            console.log(this.tag + 'localStream success.');
            this.getToken();
        }, error => {
            console.error(this.tag + 'web getUserMedia failed: ', error);
        }
        );
    }

  }

    private getToken() {

        let bodyParams = {
            roomId: this.roomConference,
            username: username,
            role: 'presenter'
        };

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        this.http.post(this.urlServer + 'token', bodyParams, options)
            .subscribe(res => {
                let token = res['_body'];
                console.log(this.tag + 'getToken: ' + token);
                this.initStream(token);
            }, err => {
                console.log(this.tag + 'getToken: ' + err);
            });
    }

  private initStream(token) {

    roomStream = Erizo.Room({ token: token });
    localStream.addEventListener("access-accepted", () => {
      console.log(this.tag + 'access-accepted');

      var subscribeToStreams = (streams) => {
        for (var index in streams) {
          var stream = streams[index];
          if (localStream.getID() !== stream.getID()) {
            roomStream.subscribe(stream, { audio: true, video: false });
          }
        }

      };

      roomStream.addEventListener("room-connected", (e) => {
        roomStream.publish(localStream);
        subscribeToStreams(e.streams);

        //console.log(this.tag + 'room-connected....' + JSON.stringify({ stream: e.streams }));
        this.rxReconnectRoom.unsubscribe();
      });


      roomStream.addEventListener('room-disconnected', (e) => {
        console.log(this.tag + "room-disconnected...");
        this.connectRoom();
        isPublished = false;
      });


      roomStream.addEventListener("stream-subscribed", (e) => {
        //remote stream.
        let remoteStream = e.stream;
        let isDuplicate = false;

        //check duplicate in store
        subscribePeerStore.forEach(s => {
          if (remoteStream.getID() == s.stream.getID()) {
            isDuplicate = true;
          }
        })

        if (isDuplicate == false) {
          me.setStreamAttributes();
          this.addSubscribeStore(remoteStream);
          this.addPeerList(remoteStream);
        }
        //console.log(this.tag + 'subscribeStore: ' + JSON.stringify(subscribeStore));
        remoteStream.addEventListener("stream-data", this.streamDataMessage);
        remoteStream.addEventListener("stream-attributes-update", this.streamAttributesUpdateEvent);

        //first init player audio stream.
        remoteStream.play();

        // stop remote stream audio in private mode peer.
        if (remoteStream.getAttributes().privateMode) {
          remoteStream.muteAudio(true);
          console.log(this.tag + JSON.stringify('stream STOP.. : ' + JSON.stringify(remoteStream.getAttributes())));
        } else {

          // you didn't private mode ?
          if (!localStream.getAttributes().privateMode) {
            // normal mode
            console.log(this.tag + JSON.stringify('stream PLAY.. : ' + JSON.stringify(remoteStream.getAttributes())));
          } else {
            // private mode stop all everyone. 
            remoteStream.muteAudio(true);
            console.log(this.tag + JSON.stringify('stream STOP.. : ' + JSON.stringify(remoteStream.getAttributes())));
          }
        }

      });

      roomStream.addEventListener("stream-added", (e) => {
        console.log(this.tag + "stream-added....");
        let streams = [];
        streams.push(e.stream);

        subscribeToStreams(streams);

        if (localStream.getID() === e.stream.getID()) {
          localStreamID = localStream.getID();
          console.log(this.tag + "stream-added Published!!!");
          isPublished = true;
          me.setStreamAttributes();
        }

      });

      roomStream.addEventListener("stream-ended", (e) => {
        console.log(this.tag + 'stream-ended...');
      });

      roomStream.addEventListener("stream-removed", (e) => {

        var s = e.stream;
        // private mode
        if (isPrivateMode) {
          if (s.getAttributes().privateId == privateWithId) {
            let resMsg = '[' + s.getAttributes().privateId + '] disconnected';
            this.privateHangup(resMsg);
          }
        }
        me.setStreamAttributes();
        this.removeSubscribeStore(s.getAttributes().privateId);
        this.removePeerList(s.getAttributes().privateId);

        console.log(this.tag + 'stream-removed...');
      });

      roomStream.addEventListener('access-denied', (e) => {
        console.log(this.tag + "Access to webcam and/or microphone rejected" + e.message);
      });

      roomStream.connect();
    });
    localStream.init();
  }

  // private call "CALLER"
  private privateCall(pid) {

    // set to Private Mode enabled.
    isPrivateMode = true;
    isCaller = true;
    privateWithId = undefined;
    // set Attributes to remote stream
    me.setStreamAttributes();

    // stop audio everyone and bypass answer only.
    subscribePeerStore.forEach(s => {
      if (s.privateId == pid) {
        privateWithId = s.privateId;
        privateWith = s.stream.getAttributes().name;
        s.stream.muteAudio(false);
      } else {
        s.stream.muteAudio(true);
        console.log(me.tag + 'isPrivateMode Stop audio:' + s.stream.getAttributes().name);
      }
    });

    let callingTimeout = 5;
    let timeout = 0;

    rxPrivateCallerTimeout = Observable.timer(200, 3000).subscribe(() => {
      timeout++;

      if (timeout < callingTimeout) {
        if (privateWithId != undefined) {
          privateState = '[' + pid + '] Calling... ' + timeout;
          // caller send meessage to evernyone.
          localStream.sendData({
            type: 'privateMode',
            oper: 'caller',
            data: {
              privateIdAnswer: privateWithId, //driver id
              privateIdCaller: privateId, // caller id
            }
            , timestamp: 'timestamp'
          });
        } else {

          rxPrivateCallerTimeout.unsubscribe();
          let errMsg = '[' + pid + '] not found number or offline';
          this.privateHangup(errMsg);
        }
      } else {
        privateState = '[' + pid + '] Oops!! ...try again...';
      }

    });

  }

  private privateSignalListener(pid) {

    this.privateSignalTime = 8;
    this.privateSignalCount = 0;

    var rxPrivateSignal = Observable.timer(200, 1000).subscribe(() => {

      this.privateSignalCount++;
      //console.log(this.tag + 'privateSignalCount: ' + this.privateSignalCount)

      if (!isPrivateMode) {
        rxPrivateSignal.unsubscribe();
        this.privateSignalCount = 0;
      }

      if ((this.privateSignalCount < this.privateSignalTime) && isPrivateMode) {
        localStream.sendData({
          type: 'privateMode',
          oper: 'private-signal-listening',
          data: {
            privateIdAnswer: privateWithId, //driver id
            privateIdCaller: privateId // caller id
          }
        });
      } else {
        rxPrivateSignal.unsubscribe();
        this.privateSignalCount = 0;
        let msg = '[' + pid + '] signal timeout disconnected.';
        this.privateHangup(msg);
      }

    });
  }

  // private call "Hang up"
  privateHangup(msgState = undefined) {

    // set  Private Mode disabled.
    if (isPrivateMode) {

      if (msgState == undefined) msgState = 'disconnected';

      privateState = msgState;
      privateWith = 'none';
    }
    if (isCaller) {
      rxPrivateCallerTimeout.unsubscribe();
    }

    isPrivateMode = false;
    isCaller = false;

    // set Attributes to remote stream
    me.setStreamAttributes();

    // allow audio stream Peer normal mode everyone.
    subscribePeerStore.forEach(s => {
      if (!s.stream.getAttributes().privateMode) {
        s.stream.muteAudio(false);
      }
    });

    Observable.timer(200).subscribe(() => {
      // send meessage to evernyone.
      localStream.sendData({
        type: 'privateMode',
        oper: 'hangup',
        data: {
          privateIdAnswer: privateWithId, //driver id
          privateIdCaller: privateId // caller id
        }
        , timestamp: 'timestamp'
      });
    });

  }

  // private call "ANSWER" 
  private streamDataMessage(e) {

    if (!isPublished) return;

    console.log(e.msg);
    let msg = e.msg;

    switch (msg.type) {

      case 'privateMode':
        if (msg.oper == 'caller') {
          // answer peer.
          if (privateId == msg.data.privateIdAnswer) {

            if (isPrivateMode) {
              // send callback message to caller i'm busy !!
              localStream.sendData({
                type: 'privateMode',
                oper: 'busy',
                data: {
                  privateIdAnswer: privateId, //driver id
                  privateIdCaller: msg.data.privateIdCaller, // caller id
                }
                , timestamp: 'timestamp'
              });
            }

            // answer accept.
            else {

              // set to Private Mode
              isPrivateMode = true;
              isCaller = false;
              // set Attributes to remote stream
              me.setStreamAttributes();

              subscribePeerStore.forEach(s => {

                // allow audio with caller only.
                if (s.privateId == msg.data.privateIdCaller) {

                  privateWith = s.stream.getAttributes().name;
                  s.stream.muteAudio(false);
                  privateWithId = s.privateId;
                  privateState = '[' + msg.data.privateIdCaller + '] connected ';
                  // send callback message to caller
                  localStream.sendData({
                    type: 'privateMode',
                    oper: 'answer-accepted',
                    data: {
                      privateIdAnswer: privateId, //driver id
                      privateIdCaller: s.privateId, // caller id
                    }
                    , timestamp: 'timestamp'
                  });
                }
                // muted audio other peer.                
                else {
                  s.stream.muteAudio(true);
                }
              });
            }

          }
        }
        // caller from hangup.
        else if (msg.oper == 'hangup') {
          if (privateWithId == msg.data.privateIdCaller && isPrivateMode ) {
            me.privateHangUpFromCaller(msg.data.privateIdAnswer);
          }
        }
        // answer send callback message to caller
        else if (msg.oper == 'answer-accepted') {

          if (isPrivateMode && isCaller) {

            if (privateId == msg.data.privateIdCaller) {
              rxPrivateCallerTimeout.unsubscribe();
              privateState = '[' + msg.data.privateIdAnswer + '] connected ';
              me.privateSignalListener(msg.data.privateIdAnswer);
            }
          }
        }
        else if (msg.oper == 'private-signal-listening') {
          // answer
          if (!isCaller && isPrivateMode && (msg.data.privateIdAnswer == privateId)) {
            localStream.sendData({
              type: 'privateMode',
              oper: 'private-signal-listening',
              data: {
                privateIdAnswer: privateId, //driver id
                privateIdCaller: msg.data.privateIdCaller, // caller id
              }
            });
          }
          // caller
          if (isCaller && isPrivateMode && (privateId == msg.data.privateIdCaller)) {
            me.privateSignalCount = 0;
            console.log(me.tag + 'privateSignalCount reset..');
          }

        }
        //private line is busy.
        else if (msg.oper == 'busy') {

          if (isPrivateMode) {
            if (privateId == msg.data.privateIdCaller) {
              rxPrivateCallerTimeout.unsubscribe();
              let resMsg = '[' + msg.data.privateIdAnswer + '] private line is busy ';
              me.privateHangup(resMsg);
            }
          }
        }

      default:
        break;
    }

  }

  private streamAttributesUpdateEvent(e) {
    var s = e.stream;

    // normal
    if (!isPrivateMode) {
      if (s.getAttributes().privateMode) {
        me.mutedSubscribeStore(s.getAttributes().privateId, true);
      }
      else {
        me.mutedSubscribeStore(s.getAttributes().privateId, false);
      }
    }

  }

  private setStreamAttributes() {
    let streamAttribute = { name: username, privateId: privateId, privateMode: isPrivateMode, position: position, state: this.stateUpdate(roomStream), userId: userId };
    localStream.setAttributes(streamAttribute);
    console.log('localStream:' + JSON.stringify(localStream.getAttributes()));

  }

  private stateUpdate(roomStream) {
    //room.state to access the current state of the room. States can be 0 if it is disconnected, 1 if it is connecting, and 2 if it is connected.
    if (roomStream == undefined) return 'none';

    if (roomStream.state == 0) {
      return 'disconnected';
    }
    if (roomStream.state == 1) {
      return 'connecting';
    }
    if (roomStream.state == 2) {
      return 'connected';
    }
  }


  private privateHangUpFromCaller() {

    privateState = 'disconnected ';
    privateWith = 'none';

    isPrivateMode = false;
    isCaller = false;
    me.setStreamAttributes();

    // allow audio stream Peer normal mode everyone.
    subscribePeerStore.forEach(s => {
      if (!s.stream.getAttributes().privateMode) {
        s.stream.muteAudio(false);
      }
    });
  }


  muteAudio(isMuted) {
    if (localStream.hasAudio()) {
      if (isMuted == 'switch') { //auto switch muted
        if (this.isMuted) {
          this.playMicOnSound();
          this.localMuted(false);
          return false;
        } else {
          this.playMicOffSound();
          this.localMuted(true);
          return true;
        }
      } else {
        this.localMuted(isMuted);
      }
    } else {
      console.log(this.tag + 'the stream is not audio activated');
    }

  }

  private localMuted(isMuted) {
    localStream.muteAudio(isMuted, result => {
      console.log(result);
    });
    this.isMuted = isMuted;
    console.log(this.tag + 'isMuted = ' + this.isMuted);
  }

  getName() { return username; }

  getMuted() {
    return this.isMuted;
  }

  disconnectRoom() {

    try {
      if (roomStream.state == 0) return;
      roomStream.disconnect();
    } catch (error) {
      console.log(this.tag + 'disconnectRoom error:' + error);
    }

  }


  private btnTalkieListener(e) {
    console.log('voiceMute: ' + e);
    if (e == 'music-controls-media-button-headset-hook') {
      this.muteAudio('switch');
    }
  }

  private echoReducer(stream) { // TODO: fixEcho

    if (this.plt.is('cordova')) {

    }

  }

  private addSubscribeStore(stream) {
    subscribePeerStore.push({
      privateId: stream.getAttributes().privateId,
      privateMode: stream.getAttributes().privateMode,
      name: stream.getAttributes().name,
      stream: stream
    });
    console.log(this.tag + 'addSubscribeStore :' + stream.getAttributes().name);
  }

  private removeSubscribeStore(pid) {
    let idx = 0;
    subscribePeerStore.forEach(s => {
      if (s.stream.getAttributes().privateId == pid) {
        console.log(this.tag + 'removeSubscribeStore :' + s.stream.getAttributes().name);
        subscribePeerStore.splice(idx, 1);
      }
      idx++;
    });
  }


  private mutedSubscribeStore(pid, muted) {
    subscribePeerStore.forEach(s => {
      if (s.stream.getAttributes().privateId == pid) {
        s.stream.muteAudio(muted);
        console.log(me.tag + 'isPrivateMode audio muted:' + muted + ' name: ' + s.stream.getAttributes().name);
      }
    });
  }

  private addPeerList(stream) {
    me.peerList.push({
      privateId: stream.getAttributes().privateId,
      name: stream.getAttributes().name,
    });
  }

  private removePeerList(pid) {
    let idx = 0;
    me.peerList.forEach(s => {
      if (s.privateId == pid) {
        me.peerList.splice(idx, 1);
      }
      idx++;
    });
  }

  privatePrompt() {
    let alert = this.alertCtrl.create({
      title: 'Input Call',
      inputs: [
        {
          name: 'privateId',
          placeholder: 'privateid'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Call',
          handler: data => {
            this.privateCall(data.privateId);

          }
        }
      ]
    });
    alert.present();
  }


  // sound mute switch
  private initMusicCtrl() {
    this.nativeAudio.preloadComplex('mic_on', this.audioPath + 'button_mic-on.mp3', 0.5, 1, 0).then(res => { }, err => { });
    this.nativeAudio.preloadComplex('mic_off', this.audioPath + 'button-mic-off.mp3', 0.5, 1, 0).then(res => { }, err => { });
    this.nativeAudio.preloadComplex('private_start', this.audioPath + 'button-private-start.mp3', 0.5, 1, 0).then(res => { }, err => { });
    this.nativeAudio.preloadComplex('private_end', this.audioPath + 'button-private-end.mp3', 0.5, 1, 0).then(res => { }, err => { });

    if (this.plt.is('cordova')) {
      this.musicCtrl.subscribe().subscribe(action => {
        const e = JSON.parse(action).message;
        console.log('btnTalkieListener ' + e);
        this.btnTalkieListener(e);

      });
      this.musicCtrl.listen();
    }
  }

  private playMicOnSound() {
    this.nativeAudio.play('mic_on', () => console.log('mic_on is done playing'));
  }
  private playMicOffSound() {
    this.nativeAudio.play('mic_off', () => console.log('mic_off is done playing'));
  }


}
