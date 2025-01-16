/********************************************************************************* 
*  WEB322 – Assignment 1 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students. 
*  
*  Name: Khushi Abhay Bhandari Student ID:106774235 Date: 09/10/2024
* 
********************************************************************************/ 

const readline = require('readline');
const fs = require('fs');


const r1 = readline.createInterface(process.stdin, process.stdout);


r1.question('Do you wish to process a File (f) or directory (d):', function(selection){
    switch(selection){
        case 'f':
            r1.question('File : ',function(fileName){
                pfile(fileName);
                r1.close();
            });
            break;
        case 'd':
            r1.question('Directory :',function(dirname){
                pdir(dirname);
                r1.close();
            });
            break;
        default:
            console.log('Invalid selection');
            r1.close();
            break;

    }
  });


  //code for reading the file 
  function pfile(fileName) {
    fs.readFile(fileName,'utf8',function(err,data){
        
        if (err) {
            console.log(err);
            return;
        }

        const contents=data.replace(/\s+/g, ' '); 
        const words=contents.replace(/[^\w\s\']/g, "").split(' ');

        const count=contents.length;
        const wordscount=words.length;

        console.log(`Number of Characters (including spaces) : ${count}`);
        console.log(`Number of Words : ${wordscount}`);

       
            let longestWord = ''; 
           let maxIterator=words.length;
            for (let i = 0; i < maxIterator; i++) {
                if (words[i].length > longestWord.length) {
                    longestWord = words[i]; 
                }
            }
        console.log(`Longest Word is:${longestWord}`)


      });
  }

//function for directory
function pdir(dirname){

    fs.readdir(dirname,function(err,file){
        if(err){
            console.log(err.message);
            return;
        }

        const sortFile=file.sort().reverse();
        console.log(`Files (reverse alphabetical order): ${sortFile.join(',')}`);

        for(let i=0;i<sortFile.length;i++){
            const file=sortFile[i];
            const filePath=`${dirname}/${file}`;

            fs.stat(filePath,function(err,stats){
                if(err){
                    console.log(err);
                    return;
                }
                console.log(`${file}: ${stats.size} bytes`);
            });
        }


    });
}