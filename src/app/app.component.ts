import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  M: any = [];
  Q: any = new Map();
  QPrev: any = new Map();

  posicaoAtualX: number;
  posicaoAtualY: number;
  
  async ngOnInit(){
    await this.montaMatriz();

    let i = 0;
    //this.checkPrev()
    while(i < 100){
        this.posicaoAtualX = 4;
        this.posicaoAtualY = 0;
        //await this.atualizaQprev()

        while(!(this.posicaoAtualX == 4 && this.posicaoAtualY == 9)){
          await this.calculaQ()
          console.log('CALCULOU A BAGACA');
          console.log(this.Q);
        }
        i++;
    }

    this.getFinal();

    console.log('TERMINOU ESSA MERDA');
  }


  montaMatriz(){
    for(let i=0;i<5;i++){
      this.M[i] = [];
      for(let j=0;j<10;j++){
        this.M[i][j] = -1;

        if(i>0) this.Q.set('UP' + (i.toString() + j.toString()) ,0);
        if(i<4) this.Q.set('DW' + (i.toString() + j.toString()) ,0);
        if(j>0) this.Q.set('LF' + (i.toString() + j.toString()) ,0);
        if(j<9) this.Q.set('RG' + (i.toString() + j.toString()) ,0);
      }
    }

    this.M[4][0] =  1;
    this.M[4][1] = -100;
    this.M[4][2] = -100;
    this.M[4][3] = -100;
    this.M[4][4] = -100;
    this.M[4][5] = -100;
    this.M[4][6] = -100;
    this.M[4][7] = -100;
    this.M[4][8] = -100;
    this.M[4][9] =  100;

    this.M[3][3] =  -100;
    this.M[3][7] =  -100;

    this.M[1][1] =  -100;
    this.M[1][2] =  -100;
    this.M[1][4] =  -100;
    this.M[1][5] =  -100;
    this.M[1][7] =  -100;
  }

  /**
   * Atualiza Qprev
   */
  atualizaQprev(): void{
    var a = this.Q.keys()
    this.QPrev = new Map()
    for(let i =0; i<a.length; i++){
      this.QPrev.set(a[i], this.Q.get(a[i]))
    }
  }

  /**
   * Verifica se Q convergiu
   */
  checkPrev(): boolean{
    var a = this.Q.keys()
    var b = this.QPrev.keys()

    if(this.QPrev.size) return true;

    for(let i=0; i< a.length; i++){
      if(this.Q.get(a[i]) != this.QPrev.get(b[i])){
        return true
      }
    }

    return false
  }

  async calculaQ() {
      if(this.random()){
        // Melhor caminho
        const ac = await this.getMelhor(this.posicaoAtualX,this.posicaoAtualY);
        await this.move(ac);
      }else{
        // Aleatório
        await this.move();
      }
  }

  async transicao(xIni, yIni, xPos, yPos, ac){
    const rec = this.M[xPos][yPos];
    const action = rec + 0.5 * await this.maxVizinhanca(xPos, yPos);
    this.Q.set(ac + xIni.toString() + yIni.toString(), action);
    return
  }


  /**
   * Retorna o maior valor da vizinhaça
   */
  maxVizinhanca(XPos, YPos){
    let maxVal = [];
    maxVal.push(this.Q.get('UP'+XPos.toString()+YPos.toString()) || 0);
    maxVal.push(this.Q.get('DW'+XPos.toString()+YPos.toString()) || 0);
    maxVal.push(this.Q.get('LF'+XPos.toString()+YPos.toString()) || 0);
    maxVal.push(this.Q.get('RG'+XPos.toString()+YPos.toString()) || 0);
    return Math.max.apply(Math, maxVal)
  }

  getMelhor(XPos, YPos){
    let maxVal = [];
    maxVal.push({v:this.Q.get('UP'+XPos.toString()+YPos.toString()), ac: 'UP'}  );
    maxVal.push({v:this.Q.get('DW'+XPos.toString()+YPos.toString()), ac: 'DW'}  );
    maxVal.push({v:this.Q.get('LF'+XPos.toString()+YPos.toString()), ac: 'LF'}  );
    maxVal.push({v:this.Q.get('RG'+XPos.toString()+YPos.toString()), ac: 'RG'}  );

    maxVal = maxVal.filter(e => {
      if(e.v != undefined){
        return e;
      }
    })

    let ai = 0;
    let v = 0;

    maxVal.forEach( (e, i) => {
      if (e.v > v){
        v = e.v
        ai = i
      }
    })

    console.log(ai,maxVal,maxVal[ai]);

    return maxVal[ai].ac
  }



  getFinal(){

    let XPos = 0;
    let YPos = 4;

    while(!(XPos == 4 && YPos == 9)){
      
      let maxVal = [];
      maxVal.push({v:this.Q.get('UP'+XPos.toString()+YPos.toString()), ac: 'UP'}  );
      maxVal.push({v:this.Q.get('DW'+XPos.toString()+YPos.toString()), ac: 'DW'}  );
      maxVal.push({v:this.Q.get('LF'+XPos.toString()+YPos.toString()), ac: 'LF'}  );
      maxVal.push({v:this.Q.get('RG'+XPos.toString()+YPos.toString()), ac: 'RG'}  );

      maxVal = maxVal.filter(e => {
        if(e.v != undefined){
          return e;
        }
      })

      let ai = 0;
      let v = 0;

      maxVal.forEach( (e, i) => {
        if (e.v > v){
          v = e.v
          ai = i
        }
      })

      const ac = maxVal[ai].ac;
      console.log(ac);
      switch(ac){
        case 'UP':
            XPos--
            break;
        case 'DW':
            XPos++
            break;
        case 'LF':
             YPos--
          break;
        case 'RG':
            YPos++
            break;
      }
    }
  }


  /**
   * Move a posicao de forma aleatoria
   */
  async move(pos = null) {
    pos = pos || this.randomPosition();
    switch(pos){
      case 'UP':
          if(this.posicaoAtualX > 0){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX - 1,this.posicaoAtualY,'UP')
            this.posicaoAtualX--
            return
          }
          await this.move()
        return 
      case 'DW':
          if(this.posicaoAtualX < 4){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX + 1,this.posicaoAtualY,'DW')
            this.posicaoAtualX++
            return
          }
          await this.move()
        return 
      case 'LF':
          if(this.posicaoAtualY > 0){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX,this.posicaoAtualY - 1,'LF')
            this.posicaoAtualY--
            return
          }
          await this.move()
        return 
      case 'RG':
          if(this.posicaoAtualY < 9){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX,this.posicaoAtualY + 1,'RG')
            this.posicaoAtualY++
            return
          }
          await this.move()
        return 
    }
  }

  /**
   * Retorna true caso use o melhor caminho e false caso um randow
   */
  random(): boolean{
    if(Math.random() >= 0.7){
      return false;
    }else{
      return true;
    }
  }


  /**
   * Gera uma ação randomica
   */
  randomPosition(): string{
    const rand = Math.floor(Math.random() * 4);
    switch(rand){
      case 0:
        return 'UP'
      case 1:
        return 'DW'
      case 2:
        return 'LF'
      case 3:
        return 'RG'
    }
  }



}
