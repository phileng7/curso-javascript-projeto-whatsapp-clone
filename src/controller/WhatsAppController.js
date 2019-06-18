import { Format } from './../util/Format';
import { CameraController } from './CameraController';
import { DocumentPreviewController } from './DocumentPreviewController';
import { MicrofoneController } from './MicrofoneController';
import { Firebase } from '../util/Firebase';
import { User } from '../model/User';

export class WhatsAppController {
  constructor() {
    //console.log("WhatsAppController OK");
    this._firebase = new Firebase();
    this.initAuth();  //Firebase Auth
    this.elementsPrototype();
    this.loadElements();
    this.initEvents();   
  }

  initAuth(){
    this._firebase.initAuth()
      .then(response=>{
        //this._user = response.user;
        this._user = new User(response.user.email);   
        this._user.on('datachange', data => {
          console.log('Data Change...');
          document.querySelector('title').innerHTML = data.name + ' - WhatsApp Clone'
          this.el.inputNamePanelEditProfile.innerHTML = data.name;
          if (data.photo) {
            let photo = this.el.imgPanelEditProfile;
            photo.src = data.photo;
            photo.show();
            this.el.imgDefaultPanelEditProfile.hide();
            let photo2 = this.el.myPhoto.querySelector('img');
            photo2.src = data.photo;
            photo2.show();
          }
        });

        this._user.name = response.user.displayName;
        this._user.email = response.user.email;
        this._user.photo = response.user.photoURL; 

        this._user.save().then(() =>{
          this.el.appContent.css({
            display: 'flex'
          }); 
        })              
      })
      .catch(err => {
        console.error(err);
      });
  }

  initEvents() {
    this.el.myPhoto.on('click', e => {
      this.closeAllLeftPanel();
      this.el.panelEditProfile.show();
      setTimeout(() => {
        this.el.panelEditProfile.addClass('open');
      }, 300);
    });

    this.el.btnNewContact.on('click', e => {
      this.closeAllLeftPanel();
      this.el.panelAddContact.show();
      //De 300ms de tempo para carga do painel
      setTimeout(() => {
        this.el.panelAddContact.addClass('open');
      }, 300);      
    });

    this.el.btnClosePanelEditProfile.on('click', e=> {
      this.el.panelEditProfile.removeClass('open');
    });

    this.el.btnClosePanelAddContact.on('click', e => {
      this.el.panelAddContact.removeClass('open');
    });

    this.el.photoContainerEditProfile.on('click', e=> {
      this.el.inputProfilePhoto.click();
    });

    this.el.inputNamePanelEditProfile.on('keypress', e=> {
      if (e.key == 'Enter') {
        e.preventDefault();   //cancela o comportamento default dele
        this.el.btnSavePanelEditProfile.click();
      }
    });

    this.el.btnSavePanelEditProfile.on('click', e=> {
      console.log(this.el.inputNamePanelEditProfile.innerHTML);
      this.el.btnSavePanelEditProfile.disabled = true;
      this._user.name = this.el.inputNamePanelEditProfile.innerHTML;
      //Enviar para o Firebase
      console.log(this._user.name);
      this._user.save().then(()=>{
        this.el.btnSavePanelEditProfile.disabled = false;
      }).catch(err => {
        console.error(err);
        this.el.btnSavePanelEditProfile.disabled = false;
      });
    });

    //evento de quando o form for enviado-listener
    this.el.formPanelAddContact.on('submit', e=> {
      e.preventDefault();   //cancela o comportamento default, sem refresh
      let formData = new FormData(this.el.formPanelAddContact);
      let contact = new User(formData.get('email'));
      console.log('contact:' + JSON.stringify(contact));
      console.log('contact:' + contact.email);
      let frmemail = app.el.formPanelAddContact.getForm().get('email');
      console.log('frmemail:' + frmemail);      
      contact.on('datachange', data=>{
        if (data.name){
          this._user.addContact(contact).then(()=>{
            this.el.btnClosePanelAddContact.click();
            console.info('Contato foi adicionado!');
          });
        } else{
          console.error('Usuario nao foi encontrado')
        }
      });
      this._user.addContact();
    });

    this.el.contactsMessagesList.querySelectorAll('.contact-item').forEach(item => {
      item.on('click', el => {
        this.el.home.hide();
        this.el.main.css({
          display:'flex'
        });
      });
    });

    this.el.btnAttach.on('click', e=> {
      e.stopPropagation();
      this.el.menuAttach.addClass('open');
      document.addEventListener('click', this.closeMenuAttach.bind(this));
    });

    this.el.btnAttachPhoto.on('click', e=> {
      this.el.inputPhoto.click();    
    });

    this.el.inputPhoto.on('change', e=> {
      console.log(this.el.inputPhoto.files);
      [...this.el.inputPhoto.files].forEach(file=>{
        console.log(file);
      });
    });

    this.el.btnAttachCamera.on('click', e=> {
      this.closeAllMainPanel();
      this.el.panelCamera.addClass('open');
      this.el.panelCamera.css({
        'height': 'calc(100% - 120px)'
      });
      //console.log(this.el.videoCamera);
      this._camera = new CameraController(this.el.videoCamera);
    });

    this.el.btnClosePanelCamera.on('click', e=>{
      this.closeAllMainPanel();
      this.el.panelMessagesContainer.show();
      //console.log('close camera');
      this._camera.stop();
    });

    this.el.btnTakePicture.on('click', e=>{
      let dataUrl = this._camera.takePicture();
      this.el.pictureCamera.src = dataUrl;
      this.el.pictureCamera.show();
      this.el.videoCamera.hide();
      this.el.btnReshootPanelCamera.show();
      this.el.containerTakePicture.hide();
      this.el.containerSendPicture.show();
    });

    this.el.btnReshootPanelCamera.on('click', e=>{
      this.el.pictureCamera.hide();
      this.el.videoCamera.show();
      this.el.btnReshootPanelCamera.hide();
      this.el.containerTakePicture.show();
      this.el.containerSendPicture.hide();
    });

    this.el.btnSendPicture.on('click', e => {
      console.log(this.el.pictureCamera.src);
    });

    this.el.btnAttachDocument.on('click', e=> {      
      this.el.inputDocument.click();  //open attach pop-up
      this.closeAllMainPanel();
      this.el.panelDocumentPreview.addClass('open');
      this.el.panelDocumentPreview.css({
        'height': 'calc(100% - 120px)'
      });
    });

    this.el.inputDocument.on('change', e=>{
      if (this.el.inputDocument.files.length) {
        this.el.panelDocumentPreview.css({
          'height': '1%'
        });
        let file = this.el.inputDocument.files[0];
        this._documentPreviewController = new DocumentPreviewController(file);
        this._documentPreviewController.getPreviewData().then(result=>{          
          this.el.imgPanelDocumentPreview.src = result.src;
          this.el.infoPanelDocumentPreview.innerHTML = result.info;
          this.el.imagePanelDocumentPreview.show();
          this.el.filePanelDocumentPreview.hide();
          this.el.panelDocumentPreview.css({
            'height': 'calc(100% - 120px)'
          });
        }).catch(err=>{
          this.el.panelDocumentPreview.css({
            'height': 'calc(100% - 120px)'
          });
          //cada tipo de arquivo tem um filetype(PDF,TXT,XLS,etc)
          console.log(file.type)
          switch(file.type) {
            //xlx
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              this.el.iconPanelDocumentPreview.className='jcxhw icon-doc-xls'
              break;
              //ppt
            case 'application/vnd.ms-powerpoint':
              //pptx
            case 'application/nvd.openxmlformats-officedocument.presentatioml.presentation':
              this.el.iconPanelDocumentPreview.className='jcxhw icon-doc-ppt'
              break;
            case 'application/msword':
            //docx
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
              this.el.iconPanelDocumentPreview.className='jcxhw icon-doc-doc'
              break;
            default:
              this.el.iconPanelDocumentPreview.className='jcxhw icon-doc-generic'
              break;
          }
          this.el.filenamePanelDocumentPreview.innerHTML = file.name;
          this.el.imagePanelDocumentPreview.hide();
          this.el.filePanelDocumentPreview.show();
          //console.log('err',err);
        });
      }      
    });

    this.el.btnClosePanelDocumentPreview.on('click', e=> {
      this.closeAllMainPanel();
      this.el.panelMessagesContainer.show();
    });

    this.el.btnSendDocument.on('click', e=> {

    });

    this.el.btnAttachContact.on('click', e=> {
      this.el.modalContacts.show();
    });

    this.el.btnCloseModalContacts.on('click', e=>{
      this.el.modalContacts.hide();
    })

    this.el.btnSendMicrophone.on('click', e=> {
      this.el.recordMicrophone.show();
      this.el.btnSendMicrophone.hide();

      this._microphoneController = new MicrofoneController();
      
      this._microphoneController.on('ready', music =>{
        //console.log('ready event');
        this._microphoneController.startRecorder();
      });

      this._microphoneController.on('recordTimer', timer =>{
        this.el.recordMicrophoneTimer.innerHTML =  Format.toTime(timer);
      });
    });

    this.el.btnCancelMicrophone.on('click', e=> {
      this._microphoneController.stopRecorder();
      this.closeRecordMicrophone();
    });

    this.el.btnFinishMicrophone.on('click', e=> {
      this._microphoneController.stopRecorder();
      this.closeRecordMicrophone();
    });

    this.el.inputText.on('keypress', e=> {
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        this.el.btnSend.click();
      }
    });

    this.el.inputText.on('keyup', e=> {
      if (this.el.inputText.innerHTML.length) {
        this.el.inputPlaceholder.hide();
        this.el.btnSendMicrophone.hide();
        this.el.btnSend.show();
      } else {
        this.el.inputPlaceholder.show();
        this.el.btnSendMicrophone.show();
        this.el.btnSend.hide();
      }
    });

    this.el.btnSend.on('click', e=> {

    });

    this.el.btnEmojis.on('click', e=> {
      this.el.panelEmojis.toggleClass('open');
    });

    this.el.panelEmojis.querySelectorAll('.emojik').forEach(emoji=>{
      emoji.on('click', e=> {
        console.log(emoji.dataset.unicode);
        //clonar todas as propriedades em img
        let img = this.el.imgEmojiDefault.cloneNode();
        img.style.cssText = emoji.style.cssText;
        img.dataset.unicode = emoji.dataset.unicode;
        img.alt = emoji.dataset.unicode;
        //clonar as class tambem para o img
        emoji.classList.forEach(name => {
          img.classList.add(name);
        });
        //Aqui coloco a img dentro do inputText-NAO MAIS
        //this.el.inputText.appendChild(img);

        //Capturar a posicao do cursor do teclado
        let cursor = window.getSelection();
        //Garantir que o cursor esta dentro do input text desejado
        if (!cursor.focusNode || !cursor.focusNode.id == 'input-text') {
          this.el.inputText.focus();
          cursor = window.getSelection();
        }
        //Intervalo de selecao do cursor teclado. Apague range e coloque emoji
        let range = document.createRange();
        range = cursor.getRangeAt(0);
        range.deleteContents();

        let frag = document.createDocumentFragment();
        frag.appendChild(img);
        range.insertNode(frag);
        range.setStartAfter(img);

        //Preciso remover o "Digite uma mensagem". Forcar evento que o apaga
        this.el.inputText.dispatchEvent(new Event ('keyup'));
      });
    });
    
  }

  closeRecordMicrophone() {
    this.el.recordMicrophone.hide();
    this.el.btnSendMicrophone.show();    
  }

  closeAllMainPanel() {
    this.el.panelMessagesContainer.hide();
    this.el.panelDocumentPreview.removeClass('open');
    this.el.panelCamera.removeClass('open');
  }

  closeMenuAttach(e) {
    document.removeEventListener('click', this.closeMenuAttach);
    this.el.menuAttach.removeClass('open');
    //console.log('remove menu');
  }

  closeAllLeftPanel() {
    this.el.panelEditProfile.hide();
    this.el.panelAddContact.hide();
  }

  loadElements() {
    this.el = {}; //objeto
    document.querySelectorAll('[id]').forEach(element=> {
      this.el[Format.getCamelCase(element.id)] = element;
    });
  }

  elementsPrototype() {
    Element.prototype.hide = function() {
      this.style.display = 'none';
      return this;
    }

    Element.prototype.show = function() {
      this.style.display = 'block';
      return this;
    }

    Element.prototype.toggle = function() {
      this.style.display = (this.style.display == 'none') ? 'block' : 'none';
      return this;
    }

    Element.prototype.on = function(events, fn) {
      events.split(' ').forEach(event => {
        this.addEventListener(event, fn)
      });
      return this;
    }

    Element.prototype.css = function(styles) {
      for (let name in styles) {
        this.style[name] = styles[name];
      }
      return this;
    }

    Element.prototype.addClass = function(name) {
      this.classList.add(name);
      return this;
    }

    Element.prototype.removeClass = function(name) {
      this.classList.remove(name);
      return this;
    }

    Element.prototype.toggleClass = function(name) {
      this.classList.toggle(name);
      return this;
    }

    Element.prototype.hasClass = function(name) {
      return this.classList.contains(name);
    }

    HTMLFormElement.prototype.getForm = function () {
      return new FormData(this);
    }

    HTMLFormElement.prototype.toJSON = function () {
      let json ={};
      this.getForm().forEach((value,key) => {
        json[key] = value;
      });
      return json;
    }
  }
}