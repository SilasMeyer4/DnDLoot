import './style.css';
import { openTab } from './LoadTabs.js';
import * as loaderFunctions from './Loader.js';
import { Program } from './Program.js';


document.querySelector('#app').innerHTML = `
  <div>
    <div class="tab">
        <button class="tablinks" onclick="openTab(event, 'Loader')">Loader</button>
        <button class="tablinks" onclick="openTab(event, 'Program')">Program</button>
    </div>

    
    <div id="Loader" class="tabcontent">
        <div class="input-group">
            <label for="urlText">URL</label>
            <input type="text" id="urlText">
        </div>

        <div class="input-group">
            <label for="filePath">File</label>
            <div id="dropZone">Drag & Drop CSV File</div>
            <input type="text" id="filePath">
        </div>

        <div class="button-group">
            <button id="clearBtn">Clear</button>
            <button id="loadBtn" disabled>Load</button>
    
        </div>
    </div>
      
    <div id="Program" class="tabcontent">
          <!-- Textarea for test -->
    <div class="input-group">
        <label for="testText">Test</label>
        <textarea id="testText" rows="5" cols="50"></textarea>
    </div>

<div class="input-container">
    <div class="input-group">
        <label for="classLoot">Class Loot</label>
        <div class="loot-fields">
            <input type="number" id="classLootAmount" placeholder="Amount">
            <input type="number" id="classLootChance" placeholder="Chance">
            <!-- Replace datalist and dropdown with Select2 -->
            <select id="classLootDropdown" class="select2" style="width: 100%">
                <!-- Options will be dynamically populated by JavaScript -->
            </select>
        </div>
    </div>

    <div class="input-group">
        <label for="typeLoot">Type Loot</label>
        <div class="loot-fields">
            <input type="number" id="typeLootAmount" placeholder="Amount">
            <input type="number" id="typeLootChance" placeholder="Chance">
            <!-- Replace datalist and dropdown with Select2 -->
            <select id="typeLootDropdown" class="select2" style="width: 100%">
                <!-- Options will be dynamically populated by JavaScript -->
            </select>
        </div>
    </div>
</div>

    <div class="button-group">
        <button id="rollBtn">Roll</button>
    </div>

<div class="output-container">
  <div class="history-group">
    <label for="historyText">History</label>
    <div id="historyText" class="history-box"></div>
  </div>

  <div class="output-group">
    <label for="outputText">Output</label>
    <div id="outputText" class="output-box"></div>
  </div>
</div>
    </div>
  </div>
`

const program = new Program();

program.initProgram();

loaderFunctions.initLoader(program);

window.openTab = openTab;
document.querySelector('.tablinks').click();

// Select2 initialization for the dropdowns
$(document).ready(function() {
  // Initialize Select2 for classLootDropdown
  $('#classLootDropdown').select2({
      tags: true,  // Allow typing custom values
      placeholder: "Select or type a class",
      allowClear: true
  });

  // Initialize Select2 for typeLootDropdown
  $('#typeLootDropdown').select2({
      tags: true,  // Allow typing custom values
      placeholder: "Select or type a type",
      allowClear: true
  });
});

