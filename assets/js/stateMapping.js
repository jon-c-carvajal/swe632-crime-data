//estimated illegal immigrants from: https://www.migrationpolicy.org/programs/us-immigration-policy-program-data-hub/unauthorized-immigrant-population-profiles


var stateMap = {
	"1": {
		"name": "Alabama",
		"abbr": "AL",
		"estimated_illegal_immigrants" : 63000,
		"num_guns_2017" : 161641
	},
	"2": {
		"name": "Alaska",
		"abbr": "AK",
		"estimated_illegal_immigrants" : 11000,
		"num_guns_2017" : 15824
	},
	"4": {
		"name": "Arizona",
		"abbr": "AZ",
		"estimated_illegal_immigrants" : 226000,
		"num_guns_2017" : 179738
	},
	"5": {
		"name": "Arkansas",
		"abbr": "AR",
		"estimated_illegal_immigrants" : 63000,
		"num_guns_2017" : 79841
	},
	"6": {
		"name": "California",
		"abbr": "CA",
		"estimated_illegal_immigrants" : 3059000,
		"num_guns_2017" : 344622
	},
	"8": {
		"name": "Colorado",
		"abbr": "CO",
		"estimated_illegal_immigrants" : 162000,
		"num_guns_2017" : 92435
	},
	"9": {
		"name": "Connecticut",
		"abbr": "CT",
		"estimated_illegal_immigrants" : 102000,
		"num_guns_2017" : 82400
	},
	"10": {
		"name": "Delaware",
		"abbr": "DE",
		"estimated_illegal_immigrants" : 22000,
		"num_guns_2017" : 4852
	},
	"12": {
		"name": "Florida",
		"abbr": "FL",
		"estimated_illegal_immigrants" : 656000,
		"num_guns_2017" : 343288
	},
	"13": {
		"name": "Georgia",
		"abbr": "GA",
		"estimated_illegal_immigrants" : 351000,
		"num_guns_2017" : 190050
	},
	"15": {
		"name": "Hawaii",
		"abbr": "HI",
		"estimated_illegal_immigrants" : 36000,
		"num_guns_2017" : 7859
	},
	"16": {
		"name": "Idaho",
		"abbr": "ID",
		"estimated_illegal_immigrants" : 30000,
		"num_guns_2017" : 49566
	},
	"17": {
		"name": "Illinois",
		"abbr": "IL",
		"estimated_illegal_immigrants" : 487000,
		"num_guns_2017" : 146487
	},
	"18": {
		"name": "Indiana",
		"abbr": "IN",
		"estimated_illegal_immigrants" : 92000,
		"num_guns_2017" : 114019
	},
	"19": {
		"name": "Iowa",
		"abbr": "IA",
		"estimated_illegal_immigrants" : 38000,
		"num_guns_2017" : 28494
	},
	"20": {
		"name": "Kansas",
		"abbr": "KS",
		"estimated_illegal_immigrants" : 64000,
		"num_guns_2017" : 52634
	},
	"21": {
		"name": "Kentucky",
		"abbr": "KY",
		"estimated_illegal_immigrants" : 44000,
		"num_guns_2018" : 85763,
		"num_guns_2017" : 81068,
		"num_guns_2016" : 72199,
		"num_guns_2015" : 63628,
		"num_guns_2014" : 59240,
		"num_guns_2013" : 55670,
		"num_guns_2012" : 49024,
		"num_guns_2011" : 40500
	},
	"22": {
		"name": "Louisiana",
		"abbr": "LA",
		"estimated_illegal_immigrants" : 63000,
		"num_guns_2017" : 116831
	},
	"23": {
		"name": "Maine",
		"abbr": "ME",
		"estimated_illegal_immigrants" : 5000,
		"num_guns_2017" : 15371
	},
	"24": {
		"name": "Maryland",
		"abbr": "MD",
		"estimated_illegal_immigrants" : 247000,
		"num_guns_2017" : 103109
	},
	"25": {
		"name": "Massachusetts",
		"abbr": "MA",
		"estimated_illegal_immigrants" : 173000,
		"num_guns_2017" : 37152
	},
	"26": {
		"name": "Michigan",
		"abbr": "MI",
		"estimated_illegal_immigrants" : 129000,
		"num_guns_2017" : 65742
	},
	"27": {
		"name": "Minnesota",
		"abbr": "MN",
		"estimated_illegal_immigrants" : 83000,
		"num_guns_2017" : 79307
	},
	"28": {
		"name": "Mississippi",
		"abbr": "MS",
		"estimated_illegal_immigrants" : 25000,
		"num_guns_2017" : 35494
	},
	"29": {
		"name": "Missouri",
		"abbr": "MO",
		"estimated_illegal_immigrants" : 54000,
		"num_guns_2017" : 72996
	},
	"30": {
		"name": "Montana",
		"abbr": "MT",
		"estimated_illegal_immigrants" : 3000,
		"num_guns_2017" : 22133
	},
	"31": {
		"name": "Nebraska",
		"abbr": "NE",
		"estimated_illegal_immigrants" : 38000,
		"num_guns_2017" : 2234
	},
	"32": {
		"name": "Nevada",
		"abbr": "NV",
		"estimated_illegal_immigrants" : 129000,
		"num_guns_2017" : 76888
	},
	"33": {
		"name": "New Hampshire",
		"abbr": "NH",
		"estimated_illegal_immigrants" : 9000,
		"num_guns_2017" : 64135
	},
	"34": {
		"name": "New Jersey",
		"abbr": "NJ",
		"estimated_illegal_immigrants" : 526000,
		"num_guns_2017" : 57507
	},
	"35": {
		"name": "New Mexico",
		"abbr": "NM",
		"estimated_illegal_immigrants" : 58000,
		"num_guns_2017" : 97580
	},
	"36": {
		"name": "New York",
		"abbr": "NY",
		"estimated_illegal_immigrants" : 940000,
		"num_guns_2017" : 76207
	},
	"37": {
		"name": "North Carolina",
		"abbr": "NC",
		"estimated_illegal_immigrants" : 321000,
		"num_guns_2017" : 152238
	},
	"38": {
		"name": "North Dakota",
		"abbr": "ND",
		"estimated_illegal_immigrants" : 0,
		"num_guns_2017" : 13272
	},
	"39": {
		"name": "Ohio",
		"abbr": "OH",
		"estimated_illegal_immigrants" : 107000,
		"num_guns_2017" : 173405
	},
	"40": {
		"name": "Oklahoma",
		"abbr": "OK",
		"estimated_illegal_immigrants" : 82000,
		"num_guns_2017" : 71269
	},
	"41": {
		"name": "Oregon",
		"abbr": "OR",
		"estimated_illegal_immigrants" : 113000,
		"num_guns_2017" : 61383
	},
	"42": {
		"name": "Pennsylvania",
		"abbr": "PA",
		"estimated_illegal_immigrants" : 141000,
		"num_guns_2017" : 236377
	},
	"44": {
		"name": "Rhode Island",
		"abbr": "RI",
		"estimated_illegal_immigrants" : 26000,
		"num_guns_2017" : 4223
	},
	"45": {
		"name": "South Carolina",
		"abbr": "SC",
		"estimated_illegal_immigrants" : 87000,
		"num_guns_2017" : 105601
	},
	"46": {
		"name": "South Dakota",
		"abbr": "SD",
		"estimated_illegal_immigrants" : 6000,
		"num_guns_2017" : 21130
	},
	"47": {
		"name": "Tennessee",
		"abbr": "TN",
		"estimated_illegal_immigrants" : 121000,
		"num_guns_2017" : 99159
	},
	"48": {
		"name": "Texas",
		"abbr": "TX",
		"estimated_illegal_immigrants" : 1597000,
		"num_guns_2017" : 599696
	},
	"49": {
		"name": "Utah",
		"abbr": "UT",
		"estimated_illegal_immigrants" : 79000,
		"num_guns_2017" : 72856
	},
	"50": {
		"name": "Vermont",
		"abbr": "VT",
		"estimated_illegal_immigrants" : 0,
		"num_guns_2017" : 5872
	},
	"51": {
		"name": "Virginia",
		"abbr": "VA",
		"estimated_illegal_immigrants" : 269000,
		"num_guns_2017" : 307822
	},
	"53": {
		"name": "Washington",
		"abbr": "WA",
		"estimated_illegal_immigrants" : 229000,
		"num_guns_2017" : 91835
	},
	"54": {
		"name": "West Virginia",
		"abbr": "WV",
		"estimated_illegal_immigrants" : 6000,
		"num_guns_2017" : 35264
	},
	"55": {
		"name": "Wisconsin",
		"abbr": "WI",
		"estimated_illegal_immigrants" : 86000,
		"num_guns_2017" : 64878
	},
	"56": {
		"name": "Wyoming",
		"abbr": "WY",
		"estimated_illegal_immigrants" : 6000,
		"num_guns_2017" : 132806
	}
}
