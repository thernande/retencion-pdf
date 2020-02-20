var express = require('express');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var retencion = express.Router();


const db = {}
const sequelize = new Sequelize("Epicor10" , "SA" , "Epicor123" , { 
   host: '10.1.1.31', 
   dialect: 'mssql', 
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
    user: 'comunicaciones.abracol@abracol.com',
    pass: 'Abr4col2020'
  }
});


//peticiones apartir de aqui 
retencion.post("/", (req, res) =>{
  sequelize.query("SELECT Token_c  from Vendor WHERE Token_c = '"+req.body['token']+"'",{ type: sequelize.QueryTypes.SELECT })
  .then((resp) =>{
    if(resp[0].Token_c != req.body['token']){
      res.status(400).send({error: 'Token Invalido'})
    }
    else{
      sequelize.query("exec [dbo].[Certificado_RTF_Masivo]'"+req.body['ano']+"','"+req.body['nit']+"'",{ type: sequelize.QueryTypes.SELECT })
      .then((resp) => {
        sequelize.query("SELECT DISTINCT Resumen.Nit, Resumen.Proveedor, Resumen.Fiscalyear, Resumen.FiscalPeriod, UD39.Character01 Fecha_Declaración, UD39.Character02 Ciudad, UD39.Character03 Folio FROM(SELECT Convert(varchar(50),GL.SegValue8) as Nit, CV.SegmentName AS Proveedor,FiscalYear,FiscalPeriod,INVOICENUM FROM Erp.GLJrnDtl GL inner join Erp.COASegValues CO on GL.SegValue1 = CO.SegmentCode AND GL.COACode = CO.COACode inner join Erp.COASegValues CV ON GL.SegValue8 = CV.SegmentCode AND GL.COACode = CV.COACode left outer join Erp.APInvTax AP ON GL.VendorNum = AP.VendorNum and GL.APInvoiceNum = AP.InvoiceNum  and AP.TaxCode = 'R/F-AP' WHERE BookID = 'COLGAAP' AND GL.COACode = 'COLGAAP' AND FiscalYear = '"+req.body['ano']+"' AND FiscalPeriod between 1 and 12 AND SEGVALUE8 = '"+req.body['nit']+"' AND SegValue1 in ('23650501','23650502','23651001','23655001', '23651501','23651502', '23652001', '23652002', '23652501','23652502', '23652503', '23652504', '23652505', '23652506', '23652507','23652508', '23652509', '23652510', '23652511', '23652512', '23652513','23653001', '23653002', '23653003', '23653501', '23654001', '23654002','23654003', '23654004', '23654005', '23654501', '23655001', '23655501','23656001', '23656501', '23657001', '23657501'))Resumen Inner Join Ice.UD39 On Resumen.Fiscalyear = Ice.UD39.Key2 and Resumen.FiscalPeriod = Ice.UD39.Key3 and Ice.UD39.Key1 = 'CERTRETFT' WHERE INVOICENUM IS NOT NULL",{ type: sequelize.QueryTypes.SELECT })
  
  
          .then((respo) => {
            res.status(200).send({data1 : resp , data2 : respo})
          })
          .catch((err) => {
            res.status(400).send({error: err})
          });
      })
      .catch((err) => {
        res.status(400).send({error: 'No se han encontrado los datos de su certificado'})
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
   sequelize.query("UPDATE Vendor SET Token_c = '"+token+"' WHERE TaxPayerID = '"+req.body['nit']+"'",{ type: sequelize.QueryTypes.UPDATE } )
    .then((resp) =>{
      sequelize.query("SELECT Token_c, EMailAddress from Vendor WHERE TaxPayerID = '"+req.body['nit']+"'",{ type: sequelize.QueryTypes.SELECT })
      .then((resp) =>{
        if(resp[0].EMailAddress != '')
        {
          var mailOptions = {
          from: '"Abracol" comunicaciones.abracol@abracol.com',
          to: resp[0].EMailAddress,
          subject: 'test',
          html: `<p>Se le realiza el envio de la clave para procesar su certificado de retencion en la fuente con Abracol S.A.</p>
            <h3><strong>`+resp[0].Token_c+`</strong></h3>
            <p>Para acceder a esta opcion copie esta clave que se le ha enviado y pegue la clave en el campo de texto donde la solicito</p>`
        };
      
        transporter.sendMail(mailOptions);
        res.status(200).send({msg: 'se ha enviado un correo electronico con la clave a ingresar'})
      }
      else{
        res.status(400).send({msg: 'No cuenta con correo registrado. Por favor contactarse con nosotros para actualizar sus datos'});
      }
    });
  })
  .catch((err) => {
    res.status(400).send({error: err});
  });
})

module.exports = retencion;