<template>
    <div id="home" class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card card-body">
                    <div class="form-row mb-2">
                        <div class="col-5">
                            <label for="ano">Año</label>
                            <input type="text" id="ano" v-model="ano" class="form-control " placeholder="Ingrese el año aqui">
                        </div>
                        <div class="col-6">
                            <label for="nit">NIT</label>
                            <input type="text" id="nit" v-model="nit" class="form-control" placeholder="Ingrese su nit aqui"> 
                        </div>
                        <div class="col-12 pt-3">
                            <button class="btn btn-primary col-5" @click.prevent="prevPDF">Buscar</button>
                            <button class="btn btn-primary col-6 down" :disabled="state" @click.prevent="toPdf">Descargar PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- a partir de aqui es la impresion para el pdf -->
        <div class="container" id="capture" ref="capture" v-show="state === false">
            <div ref="capture1" id="capture1" class="container-fluid">
                <div>
                    <img src="img/logo.jpg">
                </div>
                <div class="row">
                    <h2 class="title col">CERTIFICADO DE RETENCIÓN EN LA FUENTE AÑO GRAVABLE {{ ano }}</h2>
                </div>
                <div class="row">
                    <p class="col"><strong class="mr-3">Agente Retenedor:</strong>   ABRACOL S.A</p>
                </div>
                <div class="row">
                    <p class="col">
                        <strong class="pr-5 mr-4">NIT: </strong>
                        890.911.327-1
                    </p>
                </div>
                <div class="row">
                    <p class="col"><strong class="mr-5 pr-3">Dirección: </strong> AUTOPISTA NORTE KM 20 GIRARDOTA (ANT)</p>
                </div>
                <div class="row">
                    <p class="col"><strong class="mr-5 pr-3">Telefóno: </strong> 2895150</p>
                </div>
                <div class="pt-5">
                    <p><strong class="mr-3">NIT: </strong> {{ nit | number('0,0', { thousandsSeparator: '.' }) }}</p>
                    <p>{{ proveedor }}</p>
                </div>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th class="color">CONCEPTO</th>
                            <th class="color">BASE</th>
                            <th class="color">Tarifa</th>
                            <th class="color">BASE NO RETENIDA</th>
                            <th class="color">RETENCION</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="data in datas" :key="data.id">
                            <th>
                                <p>{{ data.Concepto }}</p>
                            </th>
                            <th class="text-right">
                                <p>{{ data.Base | currency('$', 0) }}</p>
                            </th>
                            <th>
                                <p>{{ data.Tarifa }}</p>
                            </th>
                            <th class="text-right">
                                <p>{{ data.Base_NO | currency('$', 0) }}</p>
                            </th>
                            <th class="text-right">
                                <p>{{ data.Monto | currency('$', 0) }}</p>
                            </th>
                        </tr>
                        <tr class="blue">
                            <th>
                                <p>TOTAL PAGO</p>
                            </th>
                            <th class="text-right">
                                <p>{{ baseP | currency('$', 0) }}</p>
                            </th>
                            <th colspan="2">
                                <p>TOTAL RETENCION</p>
                            </th>
                            <th class="text-right">
                                <p>{{ TOT_monto | currency('$', 0) }}</p>
                            </th>
                        </tr>
                        <tr>
                            <th colspan="5">
                                <p>{{ Valor_letra }}</p>
                            </th>
                        </tr>
                    </tbody>
                </table>
                <p>Los Valores antes Mencionados fueron declarados y consignados a la dirección de Impuestos y Aduanas nacionales - DIAN, tal como se realaciona a continuación:</p>
            </div>
            <div ref="capture2" id="capture2" class="container-fluid">
                <table class="table table-bordered">
                    <thead>
                        <tr class="color">
                            <th>
                                <p>Periodo Retención</p>
                            </th>
                            <th>
                                <p>Fecha Declaración Pago</p>
                            </th>
                            <th>
                                <p>Ciudad y Declaracion de Pago</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="table in orderedTables" :key="table.id"> <!-- aui va un for de vue para llenar los datos-->
                            <td>
                                <p>{{ ano }} / {{ table.FiscalPeriod }}</p>
                            </td>
                            <td>
                                <p>{{ table.Fecha_Declaración }}</p>
                            </td>
                            <td>
                                <p>{{ table.Ciudad }} / {{ table.Folio }}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p class="pt-4 center">EXPEDIDO: GIRARDOTA, {{ date }}</p>
                <p class="pt-5 mt-5 center">Firma: ______________________________________</p>
            </div>
        </div>
        
    </div>    
</template>

<script>
    // 71578805  890943038 42689823 71733458
    export default {

        data(){
            return{
                datas:'',
                proveedor:'',
                ano: '',
                nit: '',
                URL: 'http://10.1.1.35:3002/API/customer/GetLisTByName',
                baseP: '',
                TOT_monto: '',
                Valor_letra: '',
                tables: '',
                state: true,
                date: ''
            }
        },

        computed: {
            orderedTables: function () {
                return _.orderBy(this.tables, 'FiscalPeriod')
            },
        },

        methods:
        {
            pendingTask: function(){

                
                // GET /someUrl
                this.$http.post('http://10.1.1.45:3002/TASK/pendingTask',{
                    usr: 'afc'
                },{ timeout: 50 })
                .then((response) => {




                })
                .catch((e)=>{

                    this.error = e
                    console.log(e)
                })

            },

            prevPDF(){
                console.log(this.$refs["capture"].scrollHeight);
                this.$http.post('http://localhost:3002/retencion/', {
                    ano : this.ano,
                    nit : this.nit
                })
                    .then((response) =>{
                        //datos de las tablas
                        this.proveedor = response.body.data1[0].Proveedor;
                        this.datas = response.body.data1;
                        this.baseP = response.body.data1[0].BaseP;
                        this.TOT_monto = response.body.data1[0].TOT_Monto;
                        this.Valor_letra = response.body.data1[0].Valor_letra;
                        this.tables = response.body.data2;
                        this.state= false;

                        //fecha
                        var f = new Date();
                        var v = f.getMonth() +1 + f.getDate();
                        if(v < 315 ){
                            this.date = (f.getMonth() +1) + "/" + f.getDate() + "/" + f.getFullYear();
                        }
                        else{
                            this.date = "03/15/2020";
                        }
                        console.log(this.tables);
                    })
                    .catch((err) =>{
                        console.log(err);
                    });
            },

            toPdf(){
                var doc = new jsPDF('p', 'mm', 'letter');
                let imgData;
                let pdfName = "RET-"+this.nit+"-"+this.ano;
                let sum = this.datas.length + this.tables.length;
                window.scrollTo(0,0);
                
                if(sum <= 5){
                    html2canvas(this.$refs["capture"],{
                        dpi: 300, 
                        scale: 1
                        }).then(function(canvas) {
                        imgData = canvas.toDataURL('image/png');
                        doc.addImage(imgData, 'PNG', 10, 6);
                        doc.save(pdfName+'.pdf');
                    });
                }
                else{
                    html2canvas(this.$refs["capture1"],{
                        dpi: 300, 
                        scale: 1
                        }).then(function(canvas) {
                        imgData = canvas.toDataURL('image/png');
                        doc.addImage(imgData, 'PNG', 10, 10);
                        html2canvas(document.querySelector("#capture2"),{
                            dpi: 300, 
                            scale: 1,
                            windowHeight: document.querySelector("#capture2").scrollHeight
                        }).then(function(canvas1) {
                            imgData = canvas1.toDataURL('image/png');
                            doc.addPage();
                            doc.addImage(imgData, 'PNG', 10, 10);
                            doc.save(pdfName+'.pdf');
                        });
                    });
                   
                }
            },
            
            

            created: function()
            {
                //this.pendingTask()
                
                
            }

        }
    }


</script>