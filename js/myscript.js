/**
 * Export given data in csv format
 * @param records
 * @param fileName
 */
function exportAsCsv(records, fileName) {
  var data = records;
  var csvContent = "data:text/csv;charset=utf-8,";
  data.forEach(function(infoArray, index){
    for(var i=0; i < infoArray.length; i++) {
      infoArray[i] = '"' + infoArray[i].trim().replace(/'/g, "\'").replace(/"/g, "\'") + '"';
    }
    dataString = infoArray.join(",");
    csvContent += index < data.length ? dataString+ "\n" : dataString;
  });
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  link.click();
}

/**
 * Name combinations construction
 */
let nameCombination = [["id", "company"]];
function constructNameCombination(firstName, lastName, company) {
  if(firstName && company) {
    nameCombination.push([firstName, company]);
    nameCombination.push([firstName + "." + lastName, company]);
    nameCombination.push([firstName + "." + lastName.charAt(0), company]);
    nameCombination.push([firstName + "_" + lastName, company]);
    nameCombination.push([firstName + lastName, company]);
    nameCombination.push([firstName + lastName.charAt(0), company]);
    nameCombination.push([firstName.charAt(0) + lastName, company]);
  }
}

/**
 * Iterate each result set and construct LinkedIn data
 */
function constructData() {
  $(".search-results .result").each(function() {
    let isRequired = false;

    let nameArray = ($(this).find(".bd h3 a.title").text() || "").split(" ");
    let firstName = nameArray.splice(0,1)[0];
    let lastName = nameArray.splice(nameArray.length - 1, 1)[0];
    let middleName = "";
    if(nameArray.length) middleName = nameArray.join(" ");

    let title1 = "", company1 = "", title2 = ""; company2 = "";
    let currenthtml1 = ($(this).find(".snippet dd .title:eq(0)").html() || "").split(" at ");
    let titleHtml1 = $("<div>" + currenthtml1[0] + "</div>");
    let companyHtml1 = $("<div>" + currenthtml1[1] + "</div>");
    if(titleHtml1.find("b").length && companyHtml1.find("b").length) {
      title1 = titleHtml1.text();
      company1 = companyHtml1.text();
      isRequired = true;
    }

    let currenthtml2 = ($(this).find(".snippet dd .title:eq(1)").html() || "").split("at");
    let titleHtml2 = $("<div>" + currenthtml2[0] + "</div>");
    let companyHtml2 = $("<div>" + currenthtml2[1] + "</div>");
    if(titleHtml2.find("b").length && companyHtml2.find("b").length) {
      title2 = titleHtml2.text();
      company2 = companyHtml2.text();
      isRequired = true;
    }

    let location = $(this).find(".demographic dd.separator").text() || "";
    let city = "", country = "";
    if(location.indexOf("Area,") !== -1) {
      locationArray = location.split("Area,");
      city = locationArray[0];
      country = locationArray[1];
    } else if(location.indexOf("Area") !== -1) {
      locationArray = location.split("Area");
      city = locationArray[0];
      country = locationArray[1];
    } else if(location.indexOf(",") !== -1) {
      locationArray = location.split(",");
      country = locationArray.splice(locationArray.length - 1, 1)[0];;
      city = locationArray.join(", ");
    } else {
      country = location;
    }
    let industry = $(this).find(".demographic dd:eq(1)").text() || "";
    let row = [firstName, lastName, middleName, title1, company1, title2, company2, city, country, industry];
    _.each(linkedInData, function(record, index) {
      if(_.isEqual(record, row)) isRequired = false;
    })
    if(isRequired) {
      linkedInData.push(row);
      constructNameCombination(firstName, lastName, company1 + (company2 ? ", " : "") + company2);
    }
  });
}

/**
 * Recursive call to unbind & bind events whenever result dom changes
 */
function init() {
  //Add current page data to linkedInData on clicking page link.
  $('.page-link').off('click').on('click', function(event) {
    constructData();
    //Subtract header
    $(".export-wrapper .records-count span").html(linkedInData.length - 1);
  });
  $(".non-artdeco").off("DOMSubtreeModified").on("DOMSubtreeModified", function(){
    init();
  });
}

/**
 * Append DOM to linkedin page positioning fixed to top right
 */
$("body").append($(
  "<div class='export-wrapper'>" +
    "<div class='records-count'><span> 0 </span> Record(s) Added</div>" +
    "<div class='reset-records'> Reset Records </div>" +
    "<div class='export-as-csv'> Export Records </div>" +
  "</div>"
));

/**
 * Construct data and call appropriate methods to download data in csv
 */
$(".export-as-csv").off("click").on("click", function(event) {
  constructData();
  exportAsCsv(linkedInData, "linked-data.csv");
  exportAsCsv(nameCombination, "name-combination.csv");
});

/**
 * Reset LinkedIn data and name combinations
 */
$(".reset-records").off("click").on("click", function(event) {
  linkedInData = [["First Name", "Last Name", "Middle Name", "Job Title1", "Company1", "Job Title2", "Company2", "City", "Country", "Industry"]];
  nameCombination = [["id", "company"]];
  //subtract header
  $(".export-wrapper .records-count span").html(linkedInData.length - 1);
});

//Starting point for the script
let linkedInData = [["First Name", "Last Name", "Middle Name", "Job Title1", "Company1", "Job Title2", "Company2", "City", "Country", "Industry"]];
init();

//Navigate to next page after every 20 secs
let paginate = setInterval(function(){
  if($("#results-pagination .next .page-link").length) {
    $("#results-pagination .next .page-link")[0].click();
  } else {
    $(".export-as-csv").click();
    clearInterval(paginate);
  }
}, 20000);
