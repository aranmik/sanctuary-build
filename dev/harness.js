'use strict';
const fs=require('fs');const vm=require('vm');const path=require('path');
function mkEl(){const store={textContent:'',innerHTML:'',value:'',checked:false};const dataset={};const cl={add(){},remove(){},toggle(){},contains(){return false;}};const st={};
 return new Proxy(function(){},{get(t,k){switch(k){case 'addEventListener':case 'removeEventListener':case 'focus':case 'click':case 'setAttribute':case 'appendChild':case 'remove':return()=>{};case 'querySelector':return()=>mkEl();case 'querySelectorAll':case 'getElementsByClassName':return()=>[];case 'closest':return()=>null;case 'classList':return cl;case 'style':return st;case 'dataset':return dataset;case 'children':case 'childNodes':return[];case 'parentNode':return null;case 'getBoundingClientRect':return()=>({top:0,left:0,width:0,height:0});case 'getContext':return()=>({fillRect(){},clearRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){}});}if(k in store)return store[k];return undefined;},set(t,k,v){store[k]=v;return true;},apply(){return mkEl();}});}
const _els={};
const doc={getElementById(id){return _els[id]||(_els[id]=mkEl());},querySelector(){return mkEl();},querySelectorAll(){return[];},createElement(){return mkEl();},addEventListener(){},removeEventListener(){},body:mkEl(),documentElement:mkEl()};
const AC=function(){return{createOscillator:()=>({connect(){},start(){},stop(){},frequency:{value:0}}),createGain:()=>({connect(){},gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}}}),destination:{},currentTime:0};};
const win={addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 0;},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},AudioContext:AC,webkitAudioContext:AC};
const sb={window:win,document:doc,requestAnimationFrame(){return 0;},cancelAnimationFrame(){},localStorage:win.localStorage,AudioContext:AC,webkitAudioContext:AC,console:console,JSON:JSON,Math:Math,Date:Date,parseInt:parseInt,parseFloat:parseFloat,isNaN:isNaN,Object:Object,Array:Array,String:String,Number:Number,Boolean:Boolean,setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){}};
sb.globalThis=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8').match(/<script>([\s\S]*)<\/script>/)[1],sb,{filename:'inline.js'});
module.exports={sb,_els};
