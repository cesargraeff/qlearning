import { Component, OnInit } from '@angular/core';
import * as deepEqual from "deep-equal";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  M: any = [];
  Q: any = {};
  QPrev: any = {};

  parseInt = parseInt;

  executando: boolean = false;

  posicaoIniX: number = 4;
  posicaoIniY: number = 0;

  posicaoFimX: number = 4;
  posicaoFimY: number = 9;

  randomico = 0.7;
  propagacao: number = 0.5;

  iteracoes: number = 1000;

  posicaoAtualX: number;
  posicaoAtualY: number;
  ac: string;

  converge: number = 0;
  ep = 0;
  taxaConverge: number = 50;

  objectKeys = Object.keys;

  ngOnInit(){
    this.montaMatriz();
  }

  async iniciar(){
    this.ep = 0;
    this.executando = true;
    setTimeout(async () => {
      let i = 0;

      await this.montaMatriz();

      while(this.checkPrev() && this.ep < this.iteracoes){
          this.posicaoAtualX = this.posicaoIniX;
          this.posicaoAtualY = this.posicaoIniY;
          await this.atualizaQprev()

          while(!(this.posicaoAtualX == this.posicaoFimX && this.posicaoAtualY == this.posicaoFimY)){
            await this.calculaQ()
          }
          this.Q['' + this.posicaoAtualX + this.posicaoAtualY + this.ac] =  100;
          this.ep++;
      }

      this.executando = false;

      this.getFinal();

    },500);
  
  }


  montaMatriz(){

    this.Q = {};

    for(let i=0;i<5;i++){
      this.M[i] = [];
      for(let j=0;j<10;j++){
        this.M[i][j] = -1;

        if(i>0) this.Q['' + i + j + 'UP'] = 0;
        if(i<4) this.Q['' + i + j + 'DW'] = 0;
        if(j>0) this.Q['' + i + j + 'LF'] = 0;
        if(j<9) this.Q['' + i + j + 'RG'] = 0;
      }
    }

    this.M[4][1] = -100;
    this.M[4][2] = -100;
    this.M[4][3] = -100;
    this.M[4][4] = -100;
    this.M[4][5] = -100;
    this.M[4][6] = -100;
    this.M[4][7] = -100;
    this.M[4][8] = -100;

    this.M[3][3] =  -100;
    this.M[3][7] =  -100;

    this.M[1][1] =  -100;
    this.M[1][2] =  -100;
    this.M[1][4] =  -100;
    this.M[1][5] =  -100;
    this.M[1][7] =  -100;

    this.M[this.posicaoFimX][this.posicaoFimY] =  100;
  }

  /**
   * Atualiza Qprev
   */
  atualizaQprev(): void {
    this.QPrev = Object.assign({}, this.Q)
  }

  /**
   * Verifica se Q convergiu
   */
  checkPrev(): boolean{
    if(deepEqual(this.Q,this.QPrev)){
      this.converge++;
      if(this.converge == this.taxaConverge){
        return false;
      }
    }else{
        this.converge = 0;
    }
    return true;
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
      const action = rec + this.propagacao * aux;
      this.Q['' + xIni + yIni + ac] = action;
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
    maxVal.push(this.Q[''+XPos+YPos+'UP']);
    maxVal.push(this.Q[''+XPos+YPos+'DW']);
    maxVal.push(this.Q[''+XPos+YPos+'LF']);
    maxVal.push(this.Q[''+XPos+YPos+'RG']);
    maxVal = maxVal.filter(e => e !== undefined && e !== null)
    return Math.max.apply(Math, maxVal)
  }

  getMelhor(XPos, YPos){
    let maxVal = [];

    maxVal.push({v:this.Q[''+XPos+YPos+'UP'], ac: 'UP'}  );
    maxVal.push({v:this.Q[''+XPos+YPos+'DW'], ac: 'DW'}  );
    maxVal.push({v:this.Q[''+XPos+YPos+'LF'], ac: 'LF'}  );
    maxVal.push({v:this.Q[''+XPos+YPos+'RG'], ac: 'RG'}  );
  
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

    return maxVal[ai].ac
  }



  getFinal(){

    let XPos = this.posicaoIniX;
    let YPos = this.posicaoIniY;

    let i = 0;
    while(!(XPos == this.posicaoFimX && YPos == this.posicaoFimY) && i < 50){
      
      let maxVal = [];
      maxVal.push({v:this.Q[''+XPos+YPos+'UP'], ac: 'UP'}  );
      maxVal.push({v:this.Q[''+XPos+YPos+'DW'], ac: 'DW'}  );
      maxVal.push({v:this.Q[''+XPos+YPos+'LF'], ac: 'LF'}  );
      maxVal.push({v:this.Q[''+XPos+YPos+'RG'], ac: 'RG'}  );

      maxVal = maxVal.filter(e => {
        if(e.v != undefined){
          return e;
        }
      })

     // console.log(maxVal);

      let ai = 0;
      let v = -1000;

      maxVal.forEach( (e, i) => {
        if (e.v > v){
          v = e.v
          ai = i
        }
      })

      const ac = maxVal[ai].ac;
      //console.log(ac);
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

      this.M[XPos][YPos] = 1000;

      i++;
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
    if(Math.random() >= this.randomico){
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
        return 'UP';
      case 1:
        return 'DW';
      case 2:
        return 'LF';
      case 3:
        return 'RG';
    }
  }


}
