// Define our labelmap
const labelMap: {
  [key: number]: {name: string; color: string}
} = {
  1:{name:'Hello', color:'red'},
  2:{name:'Thank You', color:'yellow'},
  3:{name:'I Love You', color:'lime'},
  4:{name:'Yes', color:'blue'},
  5:{name:'No', color:'purple'},
}

// Define a drawing function
export const drawRect = (boxes: any, classes: any, scores: any, threshold: any, imgWidth: any, imgHeight: any, ctx: any)=>{
  for(let i=0; i<=boxes.length; i++){
      if(boxes[i] && classes[i] && scores[i]>threshold){
          // Extract variables
          const [y,x,height,width] = boxes[i]
          const text = classes[i]
          
          // Set styling
          ctx.strokeStyle = labelMap[text]['color']
          ctx.lineWidth = 10
          ctx.fillStyle = 'white'
          ctx.font = '30px Arial'         
          
          // DRAW!!
          ctx.beginPath()
          ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
          ctx.rect(x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/1.5);
          ctx.stroke()
      }
  }
}