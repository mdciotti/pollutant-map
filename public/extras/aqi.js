// Air Quality Index Calculations
//
// The air quality index is a piecewise linear function of the pollutant
// concentration. At the boundary between AQI categories, there is a
// discontinuous jump of one AQI unit. To convert from concentration to AQI
// this equation is used:
//
// I = (I_high - I_low) / (C_high - C_low) * (C - C_low) + I_low
//
// where:
// I = the (Air Quality) index,
// C = the pollutant concentration,
// C_low = the concentration breakpoint that is <= C,
// C_high = the concentration breakpoint that is >= C,
// I_low = the index breakpoint corresponding to C_low,
// I_high = the index breakpoint corresponding to C_high.
//
// If multiple pollutants are measured at a monitoring site, then the largest
// or "dominant" AQI value is reported for the location. The ozone AQI between
// 100 and 300 is computed by selecting the larger of the AQI calculated with a
// 1-hour ozone value and the AQI computed with the 8-hour ozone value.

let AQI_info = {
    "0": {
        "title": "Good",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 0,
        "aqi_high": 50,
        "color": "green"
    },
    "1": {
        "title": "Moderate",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 50,
        "aqi_high": 100,
        "color": "yellow"
    },
    "2": {
        "title": "Unhealthy for sensitive groups",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 100,
        "aqi_high": 150,
        "color": "orange"
    },
    "3": {
        "title": "Unhealthy",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 150,
        "aqi_high": 200,
        "color": "red"
    },
    "4": {
        "title": "Very unhealthy",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 200,
        "aqi_high": 300,
        "color": "purple"
    },
    "5": {
        "title": "Hazardous",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 300,
        "aqi_high": 400,
        "color": "maroon"
    },
    "6": {
        "title": "Hazardous",
        "sensitive_groups": "",
        "health_effects": "",
        "cautionary_statements": "",
        "aqi_low": 400,
        "aqi_high": 500,
        "color": "maroon"
    }
}

let breakpoints = {
    "AQI":  [   0,   50,  100,  150,   200,   300,   400,   500],
    "PM25": [ 0.0, 12.1, 35.5, 55.5, 150.5, 250.5, 350.5, 500.5],
    "PM10": [   0,   55,  155,  255,   355,   425,   505,   605],
    "CO":   [ 0.0,  4.5,  9.5, 12.5,  15.5,  30.5,  40.5,  50.5],
    "SO2":  [   0,   36,   76,  186,   305,   605,   805,  1005],
    "NO2":  [   0,   54,  101,  361,   650,  1250,  1650,  2050],
    "O38":  [   0,   55,   71,   86,   106,   200,  null,  null],
    "O31":  [null, null,  125,  165,   205,   405,   505,   605]
}

// let conversion = {
//     "PM25": {
//         "0": { low: 0.0, high: 12.1 },
//         "1": { low: 12.1, high: 35.5 },
//         "2": { low: 35.5, high: 55.5 },
//         "3": { low: 55.5, high: 150.5 },
//         "4": { low: 150.5, high: 250.5 },
//         "5": { low: 250.5, high: 350.5 },
//         "6": { low: 350.5, high: 500.5 }
//     }
// };

function Linear(I_high, I_low, C_high, C_low, C) {
    let I = (I_high - I_low) / (C_high - C_low) * (C - C_low) + I_low;
    return Math.round(I);
}

function AQIPM25(Concentration) {
var c;
var AQI;
c=(Math.floor(10*Conc))/10;
if (c>=0 && c<12.1)
{
	AQI=Linear(50,0,12,0,c);
}
else if (c>=12.1 && c<35.5)
{
	AQI=Linear(100,51,35.4,12.1,c);
}
else if (c>=35.5 && c<55.5)
{
	AQI=Linear(150,101,55.4,35.5,c);
}
else if (c>=55.5 && c<150.5)
{
	AQI=Linear(200,151,150.4,55.5,c);
}
else if (c>=150.5 && c<250.5)
{
	AQI=Linear(300,201,250.4,150.5,c);
}
else if (c>=250.5 && c<350.5)
{
	AQI=Linear(400,301,350.4,250.5,c);
}
else if (c>=350.5 && c<500.5)
{
	AQI=Linear(500,401,500.4,350.5,c);
}
else
{
	AQI="Out of Range";
}
return AQI;
}
//line63
function AQIPM10(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=Math.floor(Conc);
if (c>=0 && c<55)
{
	AQI=Linear(50,0,54,0,c);
}
else if (c>=55 && c<155)
{
	AQI=Linear(100,51,154,55,c);
}
else if (c>=155 && c<255)
{
	AQI=Linear(150,101,254,155,c);
}
else if (c>=255 && c<355)
{
	AQI=Linear(200,151,354,255,c);
}
else if (c>=355 && c<425)
{
	AQI=Linear(300,201,424,355,c);
}
else if (c>=425 && c<505)
{
	AQI=Linear(400,301,504,425,c);
}
else if (c>=505 && c<605)
{
	AQI=Linear(500,401,604,505,c);
}
else
{
	AQI="Out of Range";
}
return AQI;
}
//line104
function AQICO(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=(Math.floor(10*Conc))/10;
if (c>=0 && c<4.5)
{
	AQI=Linear(50,0,4.4,0,c);
}
else if (c>=4.5 && c<9.5)
{
	AQI=Linear(100,51,9.4,4.5,c);
}
else if (c>=9.5 && c<12.5)
{
	AQI=Linear(150,101,12.4,9.5,c);
}
else if (c>=12.5 && c<15.5)
{
	AQI=Linear(200,151,15.4,12.5,c);
}
else if (c>=15.5 && c<30.5)
{
	AQI=Linear(300,201,30.4,15.5,c);
}
else if (c>=30.5 && c<40.5)
{
	AQI=Linear(400,301,40.4,30.5,c);
}
else if (c>=40.5 && c<50.5)
{
	AQI=Linear(500,401,50.4,40.5,c);
}
else
{
	AQI="Out of Range";
}
return AQI;
}
//line145
function AQISO21hr(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=Math.floor(Conc);
if (c>=0 && c<36)
{
	AQI=Linear(50,0,35,0,c);
}
else if (c>=36 && c<76)
{
	AQI=Linear(100,51,75,36,c);
}
else if (c>=76 && c<186)
{
	AQI=Linear(150,101,185,76,c);
}
else if (c>=186 && c<=304)
{
	AQI=Linear(200,151,304,186,c);
}
else if (c>=304 && c<=604)
{
	AQI="SO21hrmessage";
}
else
{
	AQI="Out of Range";
}
return AQI;
}
function AQISO224hr(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=Math.floor(Conc);
if (c>=0 && c<=304)
{
	AQI="SO224hrmessage";
}

else if (c>=304 && c<605)
{
	AQI=Linear(300,201,604,305,c);
}
else if (c>=605 && c<805)
{
	AQI=Linear(400,301,804,605,c);
}
else if (c>=805 && c<=1004)
{	
	AQI=Linear(500,401,1004,805,c);
}
else
{
	AQI="Out of Range";
}
return AQI;
}
//line186
function AQIOzone8hr(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=(Math.floor(Conc))/1000;

if (c>=0 && c<.060)
{
	AQI=Linear(50,0,0.059,0,c);
}
else if (c>=.060 && c<.076)
{
	AQI=Linear(100,51,.075,.060,c);
}
else if (c>=.076 && c<.096)
{
	AQI=Linear(150,101,.095,.076,c);
}
else if (c>=.096 && c<.116)
{
AQI=Linear(200,151,.115,.096,c);
}
else if (c>=.116 && c<.375)
{
	AQI=Linear(300,201,.374,.116,c);
}
else if (c>=.375 && c<.605)
{
	AQI="O3message";
}
else
{
	AQI="Out of Range";
}
return AQI;
}
//line219

function AQIOzone1hr(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=(Math.floor(Conc))/1000;
if (c>=.125 && c<.165)
{
	AQI=Linear(150,101,.164,.125,c);
}
else if (c>=.165 && c<.205)
{
	AQI=Linear(200,151,.204,.165,c);
}
else if (c>=.205 && c<.405)
{
	AQI=Linear(300,201,.404,.205,c);
}
else if (c>=.405 && c<.505)
{
	AQI=Linear(400,301,.504,.405,c);
}
else if (c>=.505 && c<.605)
{


	AQI=Linear(500,401,.604,.505,c);
}
else
{
	AQI="Out of Range";
}
return AQI;
}

function AQINO2(Concentration)
{
var Conc=parseFloat(Concentration);
var c;
var AQI;
c=(Math.floor(Conc))/1000;
if (c>=0 && c<.054)
{
	AQI=Linear(50,0,.053,0,c);
}
else if (c>=.054 && c<.101)
{
	AQI=Linear(100,51,.100,.054,c);
}
else if (c>=.101 && c<.361)
{
	AQI=Linear(150,101,.360,.101,c);
}
else if (c>=.361 && c<.650)
{
	AQI=Linear(200,151,.649,.361,c);
}
else if (c>=.650 && c<1.250)
{
	AQI=Linear(300,201,1.249,.650,c);
}
else if (c>=1.250 && c<1.650)
{
	AQI=Linear(400,301,1.649,1.250,c);
}
else if (c>=1.650 && c<=2.049)
{
	AQI=Linear(500,401,2.049,1.650,c);
}
else
{
	AQI="Out of Range";
}
return AQI;
}

function AQICategory(AQIndex)
{
var AQI=parseFloat(AQIndex)
var AQICategory;
if (AQI<=50)
{
	AQICategory="Good";
}
else if (AQI>50 && AQI<=100)
{
	AQICategory="Moderate";
}
else if (AQI>100 && AQI<=150)
{
	AQICategory="Unhealthy for Sensitive Groups";
}
else if (AQI>150 && AQI<=200)
{
	AQICategory="Unhealthy";
}
else if (AQI>200 && AQI<=300)
{
	AQICategory="Very Unhealthy";
}
else if (AQI>300 && AQI<=400)
{
	AQICategory="Hazardous";
}
else if (AQI>400 && AQI<=500)
{
	AQICategory="Hazardous";
}
else
{
	AQICategory="Out of Range";
}
return AQICategory;
}