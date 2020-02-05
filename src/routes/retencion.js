var express = require('express');
const Sequelize = require('sequelize');

var retencion = express.Router();

var datos;


const db = {}
const sequelize = new Sequelize("Epicor10" , "SA" , "Epicor123" , { // -/3/88jmu4PXS>97
   host: '10.1.1.31',
   dialect: 'mssql',
   operatorAliases: false,
   timezone: "-05:00",
   pool:{
     max: 5,
     min: 0,
     acquire: 30000,
     idle: 10000
   }
})

db.sequelize = sequelize

retencion.post("/", (req, res) =>{
  console.log(req.body);
    sequelize.query("exec [dbo].[Certificado_RTF_Masivo]'"+req.body['ano']+"','"+req.body['nit']+"'",{ type: sequelize.QueryTypes.SELECT })
    .then((resp) => {
      sequelize.query("SELECT Resumen.*, UD39.Character01 Fecha_Declaración, UD39.Character02 Ciudad, UD39.Character03 Folio FROM (SELECT Convert(varchar(50),GL.SegValue8) as Nit, CV.SegmentName AS Proveedor,FiscalYear,FiscalPeriod FROM Erp.GLJrnDtl GL inner join Erp.COASegValues CO on GL.SegValue1 = CO.SegmentCode AND GL.COACode = CO.COACode inner join Erp.COASegValues CV ON GL.SegValue8 = CV.SegmentCode AND GL.COACode = CV.COACode left outer join Erp.APInvTax AP ON GL.VendorNum = AP.VendorNum and GL.APInvoiceNum = AP.InvoiceNum  and AP.TaxCode = 'R/F-AP' WHERE BookID = 'COLGAAP' AND GL.COACode = 'COLGAAP' AND FiscalYear = '"+req.body['ano']+"' AND FiscalPeriod between 1 and 12 AND SEGVALUE8 = '"+req.body['nit']+"' AND SegValue1 in ('23650501','23650502','23651001','23655001', '23651501','23651502', '23652001', '23652002', '23652501', '23652502', '23652503', '23652504', '23652505', '23652506', '23652507', '23652508', '23652509', '23652510', '23652511', '23652512', '23652513', '23653001', '23653002', '23653003', '23653501', '23654001', '23654002', '23654003', '23654004', '23654005', '23654501', '23655001', '23655501', '23656001', '23656501', '23657001', '23657501'))Resumen Inner Join Ice.UD39 On Resumen.Fiscalyear = Ice.UD39.Key2 and Resumen.FiscalPeriod = Ice.UD39.Key3 and Ice.UD39.Key1 = 'CERTRETFT';",{ type: sequelize.QueryTypes.SELECT })
        .then((respo) => {
          console.log(respo);
          res.status(200).send({data1 : resp , data2 : respo})
        })
        .catch((err) => {
          console.log(err);
          res.send();
        });
      // res.send(resp);
    })
    .catch((err) => {
      console.log(err);
    });
    
      })

      retencion.get("/")

module.exports = retencion;