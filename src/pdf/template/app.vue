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
                            <button class="btn btn-primary col-5" @click="validate" data-target="#Validate">Buscar</button>
                            <button class="btn btn-primary col-6 down" @click.prevent="toPdf" :disabled="state">Solicitar PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- modal para validar token (?) -->
        <div class="modal fade" id="Validate" tabindex="-1" role="dialog" aria-labelledby="Validate" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Solicitar clave</h5>
                        <button type="button"  class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true" id="close-modal">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                          <label for="Solicitar">Si cuenta con la clave para buscar su certificado de retencion, por favor introduzcala o puede solicitar el envio de la clave a su correo electronico como proveedor dando clic al boton "Solicitar Clave"</label>
                          <input type="text" v-model="token" class="form-control" id="Solicitar" aria-describedby="helpId" placeholder="Ingrese su clave aqui">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click.prevent="Request">Solicitar Clave</button>
                        <button type="button" class="btn btn-primary" @click.prevent="prevPDF">Buscar Certificado</button>
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
                <div class="pt-5 pb-2">
                    <p><strong class="mr-5">NIT: </strong> {{ nit | number('0,0', { thousandsSeparator: '.' }) }}</p>
                    <p><strong class="mr-2">Retenido a: </strong>{{ proveedor }}</p>
                </div>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th class="color">CONCEPTO</th>
                            <th class="color">BASE</th>
                            <th class="color">Tarifa</th>
                            <th class="color">RETENCION</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="data in datas" :key="data.id">
                            <th>
                                <p>{{ data.Concepto }}</p>
                            </th>
                            <th class="text-right">
                                <p>{{ data.Base | currency('$', 2) }}</p>
                            </th>
                            <th>
                                <p>{{ data.Tarifa }}</p>
                            </th>
                            <th class="text-right">
                                <p>{{ data.Monto | currency('$', 2) }}</p>
                            </th>
                        </tr>
                        <tr class="blue">
                            <th colspan="3">
                                <p>TOTAL RETENCION</p>
                            </th>
                            <th class="text-right" colspan="2">
                                <p>{{ TOT_monto | currency('$', 2) }}</p>
                            </th>
                        </tr>
                        <tr>
                            <th colspan="5">
                                <p>{{ Valor_letra }}</p>
                            </th>
                        </tr>
                    </tbody>
                </table>
                <p class="pb-2">Los Valores antes Mencionados fueron declarados y consignados a la dirección de Impuestos y Aduanas nacionales - DIAN, tal como se realaciona a continuación:</p>
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
                baseP: '',
                TOT_monto: '',
                Valor_letra: '',
                tables: '',
                state: true,
                date: '',
                token:''
            }
        },

        computed: {
            orderedTables: function () {
                return _.orderBy(this.tables, 'FiscalPeriod')
            },
        },

        methods:
        {

            Request(){
                this.$http.post("./retencion/solicitud", {
                    nit: this.nit
                }).then((response) => {
                    alert(response.body.msg);
                });
            },
            
            validate(){
                this.$http.post("./retencion/validar", {
                    nit: this.nit
                }).then((response) => {
                    alert(response.body.msg);
                    $('#Validate').modal('toggle');
                })
                .catch((Err) =>{
                    alert('Su Nit no ha sido encontrado, por favor verifiquelo nuevamente')
                });
            },
            

            prevPDF(){
                
                this.$http.post('./retencion/', {
                    ano : this.ano,
                    nit : this.nit,
                    token: this.token
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

                        console.log(response.body.data1[0]);

                        //fecha
                        var f = new Date();
                        var v = f.getMonth() +1 + f.getDate();
                        if(v < 315 ){
                            this.date = (f.getMonth() +1) + "/" + f.getDate() + "/" + f.getFullYear();
                        }
                        else{
                            this.date = "03/15/2020";
                        }
                        $('#Validate').modal('toggle');
                        console.log(this.tables);
                    })
                    .catch((err) =>{
                        alert('Token Invalido')
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