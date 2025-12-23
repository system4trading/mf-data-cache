if(Notification.permission !== 'granted'){
  Notification.requestPermission();
}

function notifyRebalance(){
  new Notification("Portfolio Alert", {
    body: "Your portfolio drift exceeded 5%. Review recommended."
  });
}

