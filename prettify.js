var fs = require('fs')

for(let file of fs.readdirSync('./data')){
  all_qoutes = JSON.parse(fs.readFileSync("./data/" + file, options={encoding:"utf-8"}))
  for(date of Object.keys(all_qoutes)){
    for(let old_key of Object.keys(all_qoutes[date])){
      if (old_key.split(" ").length != 2){ continue }

      let new_key = old_key.split(" ")[old_key.split(" ").length-1]
      Object.defineProperty(all_qoutes[date], new_key,
        Object.getOwnPropertyDescriptor(all_qoutes[date], old_key));
      delete all_qoutes[date][old_key];

      var json = JSON.stringify(all_qoutes);

      fs.writeFileSync("./data/" + file, json, 'utf8');

}
  }
}
