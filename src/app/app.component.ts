import { Component } from '@angular/core';
import { HttpClient} from '@angular/common/http';

interface Category {

name: string;

} 

interface ResponseToClientChoice {
  success: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Quizz App';
  answer = null;
  imgUrl = null;
  categories: Category[] = [];  //categories: any = [];
  url = '';
  category = 0;
  diffuculty = 0;
  questions: any = null;
  isQuizzRunning: boolean = false;
  questionIndex: number = 0;
  clientChoice = { 
    question_id: null,
    answers: []
  };

  isClientChoiceSent: boolean = false;
  isServerResponseReceived: boolean = false;
  feedback:string = '';
  score: number = 0;
  feedbackColor: string = '#000';

  constructor(private http: HttpClient){

    //console.log('ok');
    //this.url = 'https://yesno.wtf/api';
    this.url = 'http://localhost:8000/category/json';
    this.http.get(this.url)
    .subscribe((categories: Category[]) => {

        this.categories = categories;

    });

  }

  runQuizz(){
   // Charger une collection de questions / réponses
   // En Ajx,  On doit interroger une route (endpoint)fournissant les données 

   //console.log(this.category);
   //console.log(this.diffuculty);

   let url: string = 'http://localhost:8000/question/json';
   url += `?category=${this.category}&difficulty=${this.diffuculty}`;

   this.http.get(url)
    .subscribe(res =>{
      //this.questions = questions;

      let questions:any = [];
      // Itération sur les clés de l'objet
      for(let k in res){

        let question = {

          'id' : k,
          'label' : res[k].question.label,
          'answers' : res[k].answers
        };
        questions.push(question);
      } // Fin de for

      this.questions = questions;
      this.isQuizzRunning = true;
      this.clientChoice.question_id = this.questions[this.questionIndex].id;

    })
  

  }

  validQuestion(){
    this.isClientChoiceSent = true;
    //this.clientChoice.answers = [];
    //this.questionIndex++;
    // Requête au serveur pour vérification du choix client
    let url = 'http://127.0.0.1:8000/question/client/check';
    this.http.post(url, this.clientChoice)
    .subscribe((res: ResponseToClientChoice) => {
      console.log(res); 
      if (res.success) {
        // Le client a fourni la / les bonne(s) réponse(s)
        this.feedback = 'Bien Joué  !';
        this.feedbackColor = 'green';
        this.score++;
      } else {
        this.feedback = 'Raté !';
        this.feedbackColor = 'red';
      }
      this.isServerResponseReceived = true;
    })
  }

  nextQuestion() {

    this.questionIndex++;  //Passage à la question suivante 
    this.feedback = '';
    this.isClientChoiceSent = false;
    this.isServerResponseReceived = false;

    this.clientChoice.question_id = this.questions[this.questionIndex].id;
    this.clientChoice.answers = [];
  }

  checkAnswer(question_id: number, answer_id: number){
    let index = this.clientChoice.answers.indexOf(answer_id);
    if (index === -1) {
      // answer_id de la réponse non truvé déjà présent dans le tableau clientChoice.answers => on l'ajoute
      this.clientChoice.answers.push(answer_id);

    } else {

      this.clientChoice.answers.splice(index, 1);

    }
    
    
    
  }
}
