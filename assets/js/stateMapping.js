//estimated illegal immigrants from: https://www.migrationpolicy.org/programs/us-immigration-policy-program-data-hub/unauthorized-immigrant-population-profiles


var stateMap = {
	"1": {
		"name": "Alabama",
		"abbr": "AL",
		"estimated_illegal_immigrants" : 63000
	},
	"2": {
		"name": "Alaska",
		"abbr": "AK",
		"estimated_illegal_immigrants" : 11000
	},
	"4": {
		"name": "Arizona",
		"abbr": "AZ",
		"estimated_illegal_immigrants" : 226000
	},
	"5": {
		"name": "Arkansas",
		"abbr": "AR",
		"estimated_illegal_immigrants" : 63000
	},
	"6": {
		"name": "California",
		"abbr": "CA",
		"estimated_illegal_immigrants" : 3059000
	},
	"8": {
		"name": "Colorado",
		"abbr": "CO",
		"estimated_illegal_immigrants" : 162000
	},
	"9": {
		"name": "Connecticut",
		"abbr": "CT",
		"estimated_illegal_immigrants" : 102000
	},
	"10": {
		"name": "Delaware",
		"abbr": "DE",
		"estimated_illegal_immigrants" : 22000
	},
	"12": {
		"name": "Florida",
		"abbr": "FL",
		"estimated_illegal_immigrants" : 656000
	},
	"13": {
		"name": "Georgia",
		"abbr": "GA",
		"estimated_illegal_immigrants" : 351000
	},
	"15": {
		"name": "Hawaii",
		"abbr": "HI",
		"estimated_illegal_immigrants" : 36000
	},
	"16": {
		"name": "Idaho",
		"abbr": "ID",
		"estimated_illegal_immigrants" : 30000
	},
	"17": {
		"name": "Illinois",
		"abbr": "IL",
		"estimated_illegal_immigrants" : 487000
	},
	"18": {
		"name": "Indiana",
		"abbr": "IN",
		"estimated_illegal_immigrants" : 92000
	},
	"19": {
		"name": "Iowa",
		"abbr": "IA",
		"estimated_illegal_immigrants" : 38000
	},
	"20": {
		"name": "Kansas",
		"abbr": "KS",
		"estimated_illegal_immigrants" : 64000
	},
	"21": {
		"name": "Kentucky",
		"abbr": "KY",
		"estimated_illegal_immigrants" : 44000
	},
	"22": {
		"name": "Louisiana",
		"abbr": "LA",
		"estimated_illegal_immigrants" : 63000
	},
	"23": {
		"name": "Maine",
		"abbr": "ME",
		"estimated_illegal_immigrants" : 5000
	},
	"24": {
		"name": "Maryland",
		"abbr": "MD",
		"estimated_illegal_immigrants" : 247000
	},
	"25": {
		"name": "Massachusetts",
		"abbr": "MA",
		"estimated_illegal_immigrants" : 173000
	},
	"26": {
		"name": "Michigan",
		"abbr": "MI",
		"estimated_illegal_immigrants" : 129000
	},
	"27": {
		"name": "Minnesota",
		"abbr": "MN",
		"estimated_illegal_immigrants" : 83000
	},
	"28": {
		"name": "Mississippi",
		"abbr": "MS",
		"estimated_illegal_immigrants" : 25000
	},
	"29": {
		"name": "Missouri",
		"abbr": "MO",
		"estimated_illegal_immigrants" : 54000
	},
	"30": {
		"name": "Montana",
		"abbr": "MT",
		"estimated_illegal_immigrants" : 3000
	},
	"31": {
		"name": "Nebraska",
		"abbr": "NE",
		"estimated_illegal_immigrants" : 38000
	},
	"32": {
		"name": "Nevada",
		"abbr": "NV",
		"estimated_illegal_immigrants" : 129000
	},
	
	//TODO something weird is happening from New Hampshire to North Dakota when selected on the map
	"33": {
		"name": "New Hampshire",
		"abbr": "NH",
		"estimated_illegal_immigrants" : 9000
	},
	"34": {
		"name": "New Jersey",
		"abbr": "NJ",
		"estimated_illegal_immigrants" : 526000
	},
	"35": {
		"name": "New Mexico",
		"abbr": "NM",
		"estimated_illegal_immigrants" : 58000
	},
	"36": {
		"name": "New York",
		"abbr": "NY",
		"estimated_illegal_immigrants" : 940000
	},
	"37": {
		"name": "North Carolina",
		"abbr": "NC",
		"estimated_illegal_immigrants" : 321000
	},
	"38": {
		"name": "North Dakota",
		"abbr": "ND",
		"estimated_illegal_immigrants" : 0
	},
	//end something weird happening
	"39": {
		"name": "Ohio",
		"abbr": "OH",
		"estimated_illegal_immigrants" : 107000
	},
	"40": {
		"name": "Oklahoma",
		"abbr": "OK",
		"estimated_illegal_immigrants" : 82000
	},
	"41": {
		"name": "Oregon",
		"abbr": "OR",
		"estimated_illegal_immigrants" : 113000
	},
	"42": {
		"name": "Pennsylvania",
		"abbr": "PA",
		"estimated_illegal_immigrants" : 141000
	},
	"44": {
		"name": "Rhode Island",
		"abbr": "RI",
		"estimated_illegal_immigrants" : 26000
	},
	"45": {
		"name": "South Carolina",
		"abbr": "SC",
		"estimated_illegal_immigrants" : 87000
	},
	"46": {
		"name": "South Dakota",
		"abbr": "SD",
		"estimated_illegal_immigrants" : 6000
	},
	"47": {
		"name": "Tennessee",
		"abbr": "TN",
		"estimated_illegal_immigrants" : 121000
	},
	"48": {
		"name": "Texas",
		"abbr": "TX",
		"estimated_illegal_immigrants" : 1597000
	},
	"49": {
		"name": "Utah",
		"abbr": "UT",
		"estimated_illegal_immigrants" : 79000
	},
	"50": {
		"name": "Vermont",
		"abbr": "VT",
		"estimated_illegal_immigrants" : 0
	},
	"51": {
		"name": "Virginia",
		"abbr": "VA",
		"estimated_illegal_immigrants" : 269000
	},
	"53": {
		"name": "Washington",
		"abbr": "WA",
		"estimated_illegal_immigrants" : 229000
	},
	"54": {
		"name": "West Virginia",
		"abbr": "WV",
		"estimated_illegal_immigrants" : 6000
	},
	"55": {
		"name": "Wisconsin",
		"abbr": "WI",
		"estimated_illegal_immigrants" : 86000
	},
	"56": {
		"name": "Wyoming",
		"abbr": "WY",
		"estimated_illegal_immigrants" : 6000
	}
}
