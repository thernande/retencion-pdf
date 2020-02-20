var express = require('express');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var retencion = express.Router();

// FFAdress3 colocar token temporalmente en esta tabla
// TaxPayerID es el nit en el campo vendor
// vendor es la tabla que buscar

const db = {}
const sequelize = new Sequelize("Epicor10" , "SA" , "Epicor123" , { //prod
//const sequelize = new Sequelize("test" , "root" , "" , {  //test
   host: '10.1.1.31', //prod
   //host: 'localhost', //test
   dialect: 'mssql', //prod
   //dialect: 'mysql', //test
   operatorAliases: false,
   timezone: "-05:00",
   pool:{
     max: 5,
     min: 0,
     acquire: 30000,
     idle: 10000
   },
   define: {
    timestamps: false
  }
})

db.sequelize = sequelize

//informacion para el envio de correo
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 't.hernandez@abracol.com',
    pass: 'tiempo4560'
  }
});


//peticiones apartir de aqui 
retencion.post("/", (req, res) =>{
  console.log(req.body);
  sequelize.query("SELECT FFAddress3 from Vendor WHERE FFAddress3 = '"+req.body['token']+"'",{ type: sequelize.QueryTypes.SELECT })
  .then((resp) =>{
    if(resp[0].FFAddress3 != req.body['token']){
      console.log('token invalido')
      res.status(400).send({error: 'Token Invalido'})
    }
    else{
      sequelize.query("exec [dbo].[Certificado_RTF_Masivo]'"+req.body['ano']+"','"+req.body['nit']+"'",{ type: sequelize.QueryTypes.SELECT })
      .then((resp) => {
        sequelize.query("SELECT DISTINCT Resumen.Nit, Resumen.Proveedor, Resumen.Fiscalyear, Resumen.FiscalPeriod, UD39.Character01 Fecha_Declaración, UD39.Character02 Ciudad, UD39.Character03 Folio FROM(SELECT Convert(varchar(50),GL.SegValue8) as Nit, CV.SegmentName AS Proveedor,FiscalYear,FiscalPeriod,INVOICENUM FROM Erp.GLJrnDtl GL inner join Erp.COASegValues CO on GL.SegValue1 = CO.SegmentCode AND GL.COACode = CO.COACode inner join Erp.COASegValues CV ON GL.SegValue8 = CV.SegmentCode AND GL.COACode = CV.COACode left outer join Erp.APInvTax AP ON GL.VendorNum = AP.VendorNum and GL.APInvoiceNum = AP.InvoiceNum  and AP.TaxCode = 'R/F-AP' WHERE BookID = 'COLGAAP' AND GL.COACode = 'COLGAAP' AND FiscalYear = '"+req.body['ano']+"' AND FiscalPeriod between 1 and 12 AND SEGVALUE8 = '"+req.body['nit']+"' AND SegValue1 in ('23650501','23650502','23651001','23655001', '23651501','23651502', '23652001', '23652002', '23652501','23652502', '23652503', '23652504', '23652505', '23652506', '23652507','23652508', '23652509', '23652510', '23652511', '23652512', '23652513','23653001', '23653002', '23653003', '23653501', '23654001', '23654002','23654003', '23654004', '23654005', '23654501', '23655001', '23655501','23656001', '23656501', '23657001', '23657501'))Resumen Inner Join Ice.UD39 On Resumen.Fiscalyear = Ice.UD39.Key2 and Resumen.FiscalPeriod = Ice.UD39.Key3 and Ice.UD39.Key1 = 'CERTRETFT' WHERE INVOICENUM IS NOT NULL",{ type: sequelize.QueryTypes.SELECT })
  
  
          .then((respo) => {
            console.log('token valido')
            res.status(200).send({data1 : resp , data2 : respo})
          })
          .catch((err) => {
            res.status(400).send({error: err})
          });
        // res.send(resp);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }).catch((err) => {
    res.status(400).send({error: 'Token Invalido'})
  });
    
})

retencion.post("/validar", (req, res) => {
  sequelize.query("SELECT TaxPayerID from Vendor WHERE TaxPayerID = '"+req.body['nit']+"'",{ type: sequelize.QueryTypes.SELECT })
  .then((resp) => {
    if(resp[0].TaxPayerID != req.body['nit']){
      res.status(400).send({msg: 'No se ha encontrado su Nit registrado'});
    }
    else{
      res.status(200).send({msg : 'validado'});
    }
  }).
  catch((err)=>{
    res.status(400).send({msg: 'No se ha encontrado su Nit registrado'});
  })
})

retencion.post("/solicitud", (req,res) =>{
  const payload = {
    check:  true
   };
   const token = jwt.sign(payload, app.get("llave"));
   sequelize.query("UPDATE Vendor SET FFAddress3 = '"+token.substring(0,49)+"' WHERE TaxPayerID = '"+req.body['nit']+"'",{ type: sequelize.QueryTypes.UPDATE } )
    .then((resp) =>{
      console.log(resp)
      sequelize.query("SELECT FFAddress3, EMailAddress from Vendor WHERE TaxPayerID = '"+req.body['nit']+"'",{ type: sequelize.QueryTypes.SELECT })
      .then((resp) =>{
        var mailOptions = {
          from: 't.hernandez@abracol.com',
          to: resp[0].EMailAddress,
          subject: 'test',
          text: 'se le hace envio de la clave para imprimir su reporte de retencion en la fuente '+resp[0].FFAddress3
        };
      
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email enviado: ' + info.response);
          }
        });
        res.status(200).send({msg: 'se ha enviado un correo electronico con la clave a ingresar'})
      });
    })
    .catch((err) => {
      res.status(400).send({error: err});
    });
})

module.exports = retencion;