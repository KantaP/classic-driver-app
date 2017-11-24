import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

/*
  Generated class for the GlobalProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
interface LangPack {
  read?: boolean
  words?: Array<any>
}

interface Word {
  lang: string;
  t1: string;
  t2: string;
}

@Injectable()
export class GlobalProvider {

  private lang: Subject<string>
  private langPack: Subject<LangPack>
  private langPackData: LangPack
  constructor() {
    this.lang = new Subject()
    this.langPack = new Subject()
    this.langPackData = {
      read: false,
      words: []
    }
  }

  watchLang() {
    return this.lang
  }

  setLang(lang:string) {
    this.lang.next(lang)
  }

  watchLangPack() {
    return this.langPack
  }

  setLangPack(langPack: LangPack){
    this.langPackData = langPack
    this.langPack.next(langPack)
  }

  translate(word:string){
    // console.log(this.langPackData)
    var trans = this.langPackData.words.filter((item)=>{
      // console.log(item.t1.trim() , word.toLowerCase().trim())
      return item.t1.replace( /\s/g, "") == word.toLowerCase().replace( /\s/g, "")
    })
    return (trans.length > 0) ? trans[0].t2 : word
  }



}
