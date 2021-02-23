//Import all the stuff we need
const Discord = require('discord.js');
const client = new Discord.Client();
const PasteGG = require("paste.gg");
const mimeType = require('mime-types');
const axios = require("axios");
const add = require('date-fns/add')
const format = require('date-fns/format')

const { 
  discord_bot_token,
  pastegg_secret_key,
  message_embed_colour,
  message_embed_title,
  message_description,
  message_expiration,
  message_error,
  pastegg_title,
  pastegg_description,
  pastegg_file_name,
  pastegg_visability
} = require('./config')

const contentTypes = ['application/json', 'text/plain', 'text/yaml'];
const pasteGG = new PasteGG(pastegg_secret_key)

//Tell console were up and running
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    if (message.channel.type !== 'text' || message.author.bot) return; //check if the message isnt a file
    if (!message.attachments) return; //check if the message doesnt have any attatchments
    for (const attachment of message.attachments.values()) {
      let contentType = mimeType.lookup(attachment.url); 
      if (!contentTypes.some(type => contentType === type)) continue;
      try {
      const date = add(new Date(), { //Get the current date and add a week ontop. see this for more https://date-fns.org/v2.17.0/docs/add#examples
        weeks: 1
      })

      let content = await axios.get(attachment.url); //let axios grab the url
      var result = await pasteGG.post({ //now we post the paste. check here for more info https://www.npmjs.com/package/paste.gg
        name: pastegg_title, // Optional
        description: pastegg_description, // Optional
        visibility: pastegg_visability, //Optional
        expires: date.toISOString(), //Optional
        files: [{
          name: pastegg_file_name, // Optional
          content: {
            format: "text",
            value: content.data
          }
        }]
      })

      var json = result.result; //go into the correct json bracket
      var expiration = format(date, 'dd-MM-yyyy') 

      const embed = new Discord.MessageEmbed() //Get the embed ready
      .setColor(message_embed_colour)
      .setTitle(message_embed_title)
      .setDescription(message_description + json.url + message_expiration + expiration)
      await message.channel.send(embed) //Send the embeded message

    } catch (e) {
    await message.channel.send(message_error)
    console.log(e)
   }
  }
});
client.login(discord_bot_token);