const EventEmitter =require('events')
const emmiter= new EventEmitter


//listeners first:
emmiter.on('exam', ()=>{
    console.log("Scarry stuuuuf...")
})

emmiter.on('food', ()=>{
    console.log("me no hungry")
})



function f(a: number): boolean {
  return a % 2 === 0;
}

const a: number[] = [1, 2, 3, 4, 56, 68, 7];

console.log("Filter method: ",a.filter(f));

console.log("Map method: ",a.map((a) => a * 10));


setTimeout(()=>emmiter.emit("Nothing"),500)
setTimeout(()=>emmiter.emit("food"),2000)
setTimeout(()=>emmiter.emit("exam"),1000)