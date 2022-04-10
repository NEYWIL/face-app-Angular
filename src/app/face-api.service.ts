import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';
import { EventEmitter } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class FaceApiService {

  public globalFace :any;
   uri:string='../../assets/models';


  private modelsForLoad= [
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),
  ];

  cbModels: EventEmitter<any> = new EventEmitter();

  constructor() { 
    this.globalFace = faceapi;
    this.loadModels();
  }

  public loadModels(){
    Promise.all(this.modelsForLoad).then(()=>{    
      this.cbModels.emit(true);
      console.log('modelos cargados!!');
      
    })
  }

}
