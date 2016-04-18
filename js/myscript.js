function exportAsCsv() {
  var data = records;
  records = [];
  var csvContent = "data:text/csv;charset=utf-8,";
  data.forEach(function(infoArray, index){
    for(var i=0; i < infoArray.length; i++) {
      infoArray[i] = '"' + infoArray[i].replace(/'/g, "\'").replace(/"/g, "\'") + '"';
    }
    dataString = infoArray.join(",");
    csvContent += index < data.length ? dataString+ "\n" : dataString;
  });
  console.log("csvContent", csvContent);
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");

  link.click();
}

function constructData() {
  $(".search-results .result").each(function() {
    let name = $(this).find(".bd h3 a").text() || "";
    let description = $(this).find(".description").text() || "";
    let current = $(this).find(".snippet dd .title").text() || "";
    let location = $(this).find(".demographic dd.separator").text() || "";
    let industry = $(this).find(".demographic dd:eq(1)").text() || "";
    let past = "";
    $(this).find(".snippet dd .abstract-trunc").each(function(index){
      if (index === 0) past = $(this).text();
      else past += ", "+$(this).text();
    });
    let row = [name, description, current, past, location, industry];
    let isDuplicate = false;
    _.each(records, function(record, index){
      if(_.isEqual(record, row)) isDuplicate = true;
    })
    if(!isDuplicate) records.push(row);
  });
}

function init() {
  $('.page-link').off('click').on('click', function(event) {
    constructData();
    console.log("hey");
    //subtract header
    $(".export-wrapper .records-count span").html(records.length - 1);
  });
  $(".non-artdeco").off("DOMSubtreeModified").on("DOMSubtreeModified", function(){
    console.log("this works great");
    init();
  });
}

$("body").append($(
  "<div class='export-wrapper'>" +
    "<div class='records-count'><span> 0 </span> Record(s) Added</div>" +
    "<div class='reset-records'> Reset Records </div>" +
    "<div class='export-as-csv'> Export Records </div>" +
  "</div>"
));

$(".export-as-csv").off("click").on("click", function(event) {
  constructData();
  exportAsCsv();
});

$(".reset-records").off("click").on("click", function(event) {
  records = [["name", "description", "current", "past", "location", "industry"]];
  //subtract header
  $(".export-wrapper .records-count span").html(records.length - 1);
});

let records = [["name", "description", "current", "past", "location", "industry"]];
init();
