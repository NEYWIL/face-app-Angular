import { Component, ElementRef, Input, OnInit, ViewChild,Renderer2, OnDestroy } from '@angular/core';
import { values } from 'lodash';
import { FaceApiService } from '../face-api.service';
import { VideoPlayerService } from '../video-player.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement : ElementRef;
  @Input() stream: any;
  @Input() width: number=0;
  @Input() height: number=0;

  listEvents: Array<any>=[];
  overCanvas: any;

  modelReady:boolean=true;

  filters =[
    // {
    //   type:'question',
    //   question:'¿Cómo te sientes?'
    // }
    {
      type:'image',
      image:'sunglass.png'
    }
  ]


  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private faceApiService:FaceApiService,
    private videoPlayerService:VideoPlayerService
    ) {
    
   }

  ngOnInit(): void {
    this.listenerEvents();
  }

  ngOnDestroy(): void {
    this.listEvents.forEach(event => event.unsubscribe());
  }


  listenerEvents=()=>{

    const observer1$ = this.faceApiService.cbModels.subscribe( res =>{
      // Todos los modelose estan ready
      this.modelReady=true;
      this.checkFace();

    });

 
    const observer2$ = this.videoPlayerService.cbAi
    .subscribe(({resizeDetections, displaySize, expressions, eyes}) =>{
      resizeDetections = resizeDetections[0] || null;
          // aqui dibujamos
          if(resizeDetections){
            this.drawFace(resizeDetections, displaySize,eyes)

          }
    })

    this.listEvents = [observer1$, observer2$];

  }


  drawFace = (resizedDetections, displaySize,eyes)  =>{
    const {globalFace} = this.faceApiService;
    this.overCanvas.getContext('2d').clearRect(0,0, displaySize.width, displaySize.height)
    // globalFace.draw.drawDetections(this.overCanvas, resizedDetections);
    // globalFace.draw.drawFaceLandmarks(this.overCanvas, resizedDetections);

    const scale = this.width / displaySize.with;
    console.log('sccale',displaySize.with);
    
    const elementFilterEye = document.querySelector('.filter-eye');
    this.renderer2.setStyle(elementFilterEye, 'left',`${eyes.left[0].x }px`);
    this.renderer2.setStyle(elementFilterEye, 'top',`${eyes.left[0].y }px`);
  }



  checkFace= ()=>{
    setInterval( async()=>{
      await this.videoPlayerService.getLandMark(this.videoElement)
    }, 100)
  }




  loadedMetaData():void{
    // console.log('sdasd');
    this.videoElement.nativeElement.play();
  }


  listenerPlay():void{

   const {globalFace} = this.faceApiService;
    this.overCanvas = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    this.renderer2.setProperty(this.overCanvas, 'id', 'new-canvas-over');
    this.renderer2.setStyle(this.overCanvas, 'width', `${this.width}px`);
    this.renderer2.setStyle(this.overCanvas, 'height', `${this.height}px`);
    this.renderer2.appendChild(this.elementRef.nativeElement, this.overCanvas);

  }

}
