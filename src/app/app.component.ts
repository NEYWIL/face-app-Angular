import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { VideoPlayerService } from './video-player.service';
import * as faceapi from 'face-api.js';
import { FaceApiService } from './face-api.service';
import { element } from 'protractor';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public currentStream: any;
  public dimensionVideo: any;
  listEvents: Array<any>=[];
  overCanvas: any;
  listExpressions: any = [];

  constructor(
    private FaceApiService: FaceApiService,
    private videoPlayerService: VideoPlayerService,
    private rednderer2: Renderer2,
    private elementRef: ElementRef){

  }


  ngOnInit(): void {
    this.listenerEvents();
    this.checkmediaSourcce();    
    this.getSizeCam();
    
  }

  ngOnDestroy(): void {
    this.listEvents.forEach(event => event.unsubscribe());
    
  }

  listenerEvents=()=>{
    const observer1$ = this.videoPlayerService.cbAi
    .subscribe(({resizeDetections, displaySize, expressions, videoElement}) =>{
      resizeDetections = resizeDetections[0] || null;
          // aqui dibujamos
          if(resizeDetections){
            this.listExpressions = _.map(expressions,(value,name)=>{
              return {name, value}
            });
            
            // console.log(this.listExpressions);
            
            this.createCanvasPreview(videoElement);
            this.drawFace(resizeDetections, displaySize);

          }
    })

    this.listEvents = [observer1$];

  }

  drawFace = (resizeDetections, displaySize) => {
    if(this.overCanvas){
      const {globalFace} = this.FaceApiService;
      this.overCanvas.getContext('2d').clearRect(0,0,displaySize.width, displaySize.height);
      globalFace.draw.drawFaceLandmarks(this.overCanvas, resizeDetections)
    }
  }


  checkmediaSourcce=() =>{
    if(navigator && navigator.mediaDevices){
      var constraints={
        audio:false,
        video:true
      }
      navigator.mediaDevices.getUserMedia( constraints)
      .then(stream =>{
          this.currentStream = stream;
      }).catch(() =>{
        console.log('******** ERROR NOT PERMISSION');
      })
    }else{
      console.log('********* ERROR NOT MEDIA DEVICCE');
    }
  };

  getSizeCam = () =>{    
    const elementCam: HTMLElement|any = document.querySelector('.cam');
    const {width, height}=elementCam.getBoundingClientRect();
    // console.log(width, height);
    this.dimensionVideo={width, height};
  }

  createCanvasPreview = (videoElement: any) =>{
    if (!this.overCanvas){
      const{globalFace} = this.FaceApiService;
      this.overCanvas = globalFace.createCanvasFromMedia(videoElement.nativeElement);
      this.rednderer2.setProperty(this.overCanvas,'id','new-canvas-preview');
      const elementPreview = document.querySelector('.canvas-preview');
      this.rednderer2.appendChild(elementPreview, this.overCanvas)
    }

  }


}
