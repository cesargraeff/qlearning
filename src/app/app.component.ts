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

  posicaoAntX: number; // todo verificar deixar a volta
  posicaoAntY: number; // todo verificar deixar a volta

  ac: string; // ultima açõ realizada

  async ngOnInit(){
    await this.montaMatriz();

    let i = 0;
    let ep =0
     
    while(this.checkPrev(this.QPrev) && ep < 10000){
        this.posicaoAtualX = 4;
        this.posicaoAtualY = 0;
        this.posicaoAntX = 4;
        this.posicaoAntY = 0;
        await this.atualizaQprev()

        while(!(this.posicaoAtualX == 4 && this.posicaoAtualY == 9)){
          await this.calculaQ()
        }
        await this.Q.set(this.ac + this.posicaoAtualX.toString() + this.posicaoAtualY.toString(), 100);
        console.log(ep)
        ep++;
    }
      console.log('CALCULOU A BAGACA');
      console.log(this.Q);
      console.log(this.M)


    // this.getFinal();

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

    this.M[4][0] =  -1;
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
  
  /*
   this.M[2][2] =  100;
   this.M[2][1] =  -100;
   this.M[1][1] =  -100;
   */

  }

  /**
   * Atualiza Qprev
   */
  atualizaQprev(): void {
    this.QPrev = new Map(this.Q)
  }

  /**
   * Verifica se Q convergiu
   */
  checkPrev(prev): boolean{
    let testVal;
    if (!prev.size) {
        return true;
    }
    let dif = false
    this.Q.forEach((v,k) => {
      if(prev.get(k) !== v){
        dif = true
      }
    })
    return dif;
  }

  async calculaQ() {
      if(this.random()){
        // Melhor caminho
        const ac = await this.getMelhor(this.posicaoAtualX,this.posicaoAtualY);
        // console.log('my movent is {} in [{}][{}]',ac, this.posicaoAtualX, this.posicaoAtualY, )
        await this.move(ac);
      }else{
        // Aleatório
        await this.move();
      }
  }

  async transicao(xIni, yIni, xPos, yPos, ac){
    try{
      const rec = this.M[xIni][yIni];
      const aux = await this.maxVizinhanca(xPos, yPos);
      const action = rec + 0.5 * aux;
      await this.Q.set(ac + xIni.toString() + yIni.toString(), action);
      return
    }catch(e){
      console.log('erro com', xIni, yIni, xPos, yPos, ac )
    }

  }


  /**
   * Retorna o maior valor da vizinhaça
   */
  maxVizinhanca(XPos, YPos){
    let maxVal = [];
    maxVal.push(this.Q.get('UP'+XPos.toString()+YPos.toString()));
    maxVal.push(this.Q.get('DW'+XPos.toString()+YPos.toString()));
    maxVal.push(this.Q.get('LF'+XPos.toString()+YPos.toString()));
    maxVal.push(this.Q.get('RG'+XPos.toString()+YPos.toString()));
    maxVal = maxVal.filter(e => e !== undefined && e !== null)
    return Math.max.apply(Math, maxVal)
  }

  getMelhor(XPos, YPos){
    let maxVal = [];

    if (!((XPos + 1) === this.posicaoAntX && YPos === this.posicaoAntY)){
      maxVal.push({ v: this.Q.get('UP' + XPos.toString() + YPos.toString()), ac: 'UP' });
    }

    if (!((XPos - 1) === this.posicaoAntX && YPos === this.posicaoAntY)){
      maxVal.push({ v: this.Q.get('DW' + XPos.toString() + YPos.toString()), ac: 'DW' });
    }

    if (!(XPos === this.posicaoAntX && (YPos + 1) === this.posicaoAntY)){
      maxVal.push({ v: this.Q.get('RG' + XPos.toString() + YPos.toString()), ac: 'RG' });

    }

    if (!(XPos === this.posicaoAntX && (YPos - 1) === this.posicaoAntY)){

      maxVal.push({ v: this.Q.get('LF' + XPos.toString() + YPos.toString()), ac: 'LF' });
    }
  
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

   // console.log(ai,maxVal,maxVal[ai]);

    return maxVal[ai].ac
  }



  getFinal(){

    let XPos = 0;
    let YPos = 2;

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
      // console.log(ac);
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
    this.ac = pos
    switch(pos){
      case 'UP':
          if(this.posicaoAtualX > 0){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX - 1,this.posicaoAtualY,'UP')
            this.posicaoAtualX--
            this.posicaoAntX--
            return
          }
          await this.move()
        return 
      case 'DW':
          if(this.posicaoAtualX < 4){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX + 1,this.posicaoAtualY,'DW')
            this.posicaoAtualX++
            this.posicaoAntX--
            return
          }
          await this.move()
        return 
      case 'LF':
          if(this.posicaoAtualY > 0){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX,this.posicaoAtualY - 1,'LF')
            this.posicaoAtualY--
            this.posicaoAntY--
            return
          }
          await this.move()
        return 
      case 'RG':
          if(this.posicaoAtualY < 9){
            await this.transicao(this.posicaoAtualX,this.posicaoAtualY,this.posicaoAtualX,this.posicaoAtualY + 1,'RG')
            this.posicaoAtualY++
            this.posicaoAntY++
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
