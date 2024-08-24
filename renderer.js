document.getElementById('add-skill').addEventListener('click', () => {
  const skillsContainer = document.getElementById('skills-container');
  const skillCount = skillsContainer.getElementsByClassName('skill-row').length + 1;

  const skillRow = document.createElement('div');
  skillRow.classList.add('skill-row', 'form-group', 'mb-3');
  skillRow.innerHTML = `
        <label for="skill${skillCount}" class="form-label">Habilidade ${skillCount}:</label>
        <input type="text" class="form-control skill-name mb-3" placeholder="Nome da habilidade">
        <input type="number" class="form-control skill-value mb-3" placeholder="Nível da habilidade" value="0" min="0" max="10">
        
        <div class="row">
            <div class="col-md-4 d-flex align-items-center">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="passiva${skillCount}" name="passiva${skillCount}" onchange="toggleCheckbox('passiva${skillCount}', 'bonus${skillCount}')">
                    <label class="form-check-label" for="passiva${skillCount}">Passiva</label>
                </div>
            </div>

            <div class="col-md-4 d-flex align-items-center">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="bonus${skillCount}" name="bonus${skillCount}" onchange="toggleCheckbox('bonus${skillCount}', 'passiva${skillCount}')">
                    <label class="form-check-label" for="bonus${skillCount}">Bonus</label>
                </div>
            </div>
        </div>
        
        <span class="remove-skill text-danger" style="cursor: pointer;">Remover</span>
    `;

  skillsContainer.appendChild(skillRow);

  // Attach event listener to the new remove button
  skillRow.querySelector('.remove-skill').addEventListener('click', () => {
    skillsContainer.removeChild(skillRow);
  });
});

function toggleCheckbox(selectedId, otherId) {
  var selectedCheckbox = document.getElementById(selectedId);
  var otherCheckbox = document.getElementById(otherId);

  if (selectedCheckbox.checked) {
    otherCheckbox.checked = false;
  }
}

function displayAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show mt-5" role="alert">
            <p>Sua ficha tem erros:</p>
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;
}

function validateForm() {
  // Clear previous alerts
  document.getElementById('alert-container').innerHTML = '';

  const errors = []; // Array to accumulate error messages

  const name = document.getElementById('name').value.trim();
  const group = document.getElementById('group').value;
  const classType = document.getElementById('class').value;
  const age = parseInt(document.getElementById('age').value) || 0;
  const occupation = document.getElementById('occupation').value;
  const profession = document.getElementById('profession').value.trim();
  const faceclaim = document.getElementById('faceclaim').value.trim();
  const history = window.editor.getData().trim();

  if (!name) {
    errors.push('- Nome está em branco.');
  }
  if (!group) {
    errors.push('- Você deve selecionar um grupo.');
  }
  if (!classType) {
    errors.push('- Você deve selecionar uma classe.');
  }
  if (!age) {
    errors.push('- Você deve entrar uma idade.');
  }
  if (['Vampiro', 'Biótico', 'Parademonio'].includes(group) && age > 1000) {
    errors.push('- Sua idade é alta demais para seu grupo. O máximo é 1000 anos.');
  }
  if (['Licantropo', 'Sereiano', 'Metamorfo'].includes(group) && age > 300) {
    errors.push('- Sua idade é alta demais para seu grupo. O máximo é 300 anos.');
  }
  if (['Górgona', 'Feiticeiro'].includes(group) && age > 200) {
    errors.push('- Sua idade é alta demais para seu grupo. O máximo é 200 anos.');
  }
  if (!occupation) {
    errors.push('- Você deve selecionar uma ocupação.');
  }
  if (!profession) {
    errors.push('- Você deve entrar uma profissão.');
  }
  if (!faceclaim) {
    errors.push('- Você deve entrar um faceclaim.');
  }
  if (!history) {
    errors.push('- Você deve entrar uma história de personagem.');
  }

  // Get skills values
  const skillsContainer = document.getElementById('skills-container');
  const skillRows = skillsContainer.getElementsByClassName('skill-row');
  const habilidades = [];

  for (let i = 0; i < skillRows.length; i++) {
    processSkillRow(skillRows[i], i + 1, habilidades);
  }

  // Calculate XP (using the corrected 'habilidades' array)
  const result = calcularXP({
    FOR: parseInt(document.getElementById('for').value) || 0,
    DES: parseInt(document.getElementById('des').value) || 0,
    PRE: parseInt(document.getElementById('pre').value) || 0,
    MEN: parseInt(document.getElementById('men').value) || 0,
    ALM: parseInt(document.getElementById('alm').value) || 0,
    CON: parseInt(document.getElementById('con').value) || 0,
    REF: parseInt(document.getElementById('ref').value) || 0,
    GUA: parseInt(document.getElementById('gua').value) || 0,
    AUR: parseInt(document.getElementById('aur').value) || 0,
    BIO: parseInt(document.getElementById('bio').value) || 0
  }, habilidades); // Pass the 'habilidades' array directly

  const xp_restante = result.xpRestante;

  if (xp_restante > 0) {
    errors.push(`- Você tem ${xp_restante} XP sobrando, o XP tem que ser 0. Gaste os ${xp_restante} restantes.`);
  } else if (xp_restante < 0) {
    errors.push(`- Você gastou ${Math.abs(xp_restante)} XP a mais, o XP tem que ser 0. Reduza ${Math.abs(xp_restante)} do seu gasto`);
  }

  // Display all accumulated error messages
  if (errors.length > 0) {
    displayAlert(errors.join('<br>'), 'danger');
    return false; // Prevent form submission if there are errors
  }

  return true; // Form is valid
}

document.getElementById('generate').addEventListener('click', () => {
  validateForm();
  // Get form data
  const name = document.getElementById('name').value;
  const group = document.getElementById('group').value;
  const classType = document.getElementById('class').value;
  const age = document.getElementById('age').value;
  const occupation = document.getElementById('occupation').value;
  const profession = document.getElementById('profession').value;
  const faceclaim = document.getElementById('faceclaim').value;

  // Get attribute values
  const atributos = {
    FOR: parseInt(document.getElementById('for').value) || 0,
    DES: parseInt(document.getElementById('des').value) || 0,
    PRE: parseInt(document.getElementById('pre').value) || 0,
    MEN: parseInt(document.getElementById('men').value) || 0,
    ALM: parseInt(document.getElementById('alm').value) || 0,
    CON: parseInt(document.getElementById('con').value) || 0,
    REF: parseInt(document.getElementById('ref').value) || 0,
    GUA: parseInt(document.getElementById('gua').value) || 0,
    AUR: parseInt(document.getElementById('aur').value) || 0,
    BIO: parseInt(document.getElementById('bio').value) || 0
  };

  // Get skills values
  const skillsContainer = document.getElementById('skills-container');
  const skillRows = skillsContainer.getElementsByClassName('skill-row');
  const habilidades = [];

  // Pass skillCount to the loop
  for (let i = 0; i < skillRows.length; i++) {
    processSkillRow(skillRows[i], i + 1, habilidades);
  }

  // Generate character sheet
  let characterHistory = window.editor.getData();
  let characterImage = getImageLink();
  const characterSheetHTML = gerarFicha(name, group, classType, age, occupation, profession, faceclaim, atributos, habilidades, characterHistory, characterImage);
  document.getElementById('generated-code').textContent = characterSheetHTML;

  let photoplayerCode = gerarPPCode(name, faceclaim, group);
  document.getElementById('photoplayerRegistry').placeholder = photoplayerCode;

  let occupationCode = gerarOCCode(name, group, occupation);
  document.getElementById('occupationRegistry').placeholder = occupationCode;

  const xpResult = JSON.stringify(calcularXP(atributos, habilidades), null, 2);
  document.getElementById('xp-json').textContent = xpResult;

});

function transformarString(grupo) {
  const transformacoes = {
    "Bióticos": "biotico",
    "Caçador": "cacador",
    "Ciborgue": "ciborgue",
    "Feiticeiro": "feiticeiro",
    "Górgonas": "gorgona",
    "Metamorfos": "metamorfo",
    "Licantropos": "licantropo",
    "Sereianos": "sereiano",
    "Vampiros": "vampiro",
    "Demônio": "demonio",
    "Parademônio": "parademonio"
  };

  return transformacoes[grupo] || grupo;
}

function processSkillRow(row, skillCount, habilidades) {
  const skillName = row.querySelector('.skill-name').value.trim();
  const skillValue = parseInt(row.querySelector('.skill-value').value) || 0;

  // Get the checkbox elements by their IDs (using skillCount)
  const skillPassiveCheckbox = row.querySelector(`#passiva${skillCount}`);
  const skillBonusCheckbox = row.querySelector(`#bonus${skillCount}`);

  // Check if they are checked
  const skillPassive = skillPassiveCheckbox.checked;
  const skillBonus = skillBonusCheckbox.checked;

  if (skillName) {
    habilidades.push({
      nome: skillName,
      valor: skillValue,
      passiva: skillPassive,
      bonus: skillBonus
    });
  }
}

function gerarPPCode(nome, faceclaim, grupo) {
  return `[CODE]<b><${transformarString(grupo) || 'grupo'}>${faceclaim.toUpperCase() || 'NOME DO PHOTOPLAYER'}</${transformarString(grupo) || 'grupo'}></b><br> ${nome || 'Nome Personagem'}<br>[/CODE]`;
}

function gerarOCCode(nome, grupo, ocupacao) {
  return `${nome || 'Nome do Personagem'}: ${grupo || 'Grupo'}, ${ocupacao || 'Ocupação'}.`;
}

function getImageLink() {
  const imageLink = document.getElementById('imageLink').value;
  document.getElementById('imageFrame').src = imageLink;
  return imageLink;
}

document.getElementById('sendImg').addEventListener('click', (e) => {
  e.preventDefault();
  getImageLink();
});

document.getElementById('copy-generated').addEventListener('click', () => {
  const generatedCode = document.getElementById('generated-code');
  navigator.clipboard.writeText(generatedCode.textContent).then(() => {
    alert('Ficha copiada para a área de transferência!');
  });
});

document.getElementById('copy-xp').addEventListener('click', () => {
  const xpJson = document.getElementById('xp-json');
  navigator.clipboard.writeText(xpJson.textContent).then(() => {
    alert('Resultado do XP copiado para a área de transferência!');
  });
});

document.getElementById('copy-pp').addEventListener('click', () => {
  const generatedCode = document.getElementById('photoplayerRegistry');
  navigator.clipboard.writeText(generatedCode.placeholder).then(() => {
    alert('Photoplayer copiado para a área de transferência!');
  });
});

document.getElementById('copy-oc').addEventListener('click', () => {
  const generatedCode = document.getElementById('occupationRegistry');
  navigator.clipboard.writeText(generatedCode.placeholder).then(() => {
    alert('Ocupação copiado para a área de transferência!');
  });
});

const xp_inicial = 1400;

const preco_atributos = {
  0: 0,
  1: 25,
  2: 25,
  3: 50,
  4: 50,
  5: 100,
  6: 100,
  7: 125,
  8: 125,
  9: 150,
  10: 150,
};

const preco_habilidades = {
  0: 0,
  1: 25,
  2: 25,
  3: 25,
  4: 50,
  5: 50,
  6: 75,
  7: 100,
  8: 100,
  9: 150,
  10: 150,
  11: 175,
  12: 175,
  13: 200,
  14: 200,
  15: 225,
  16: 250,
  17: 250,
  18: 275,
  19: 275,
  20: 300,
};

function calcularXP(atributos, habilidades) {
  const custoTotalAtributos = calcularCustoAtributos(atributos);
  const custoTotalHabilidades = calcularCustoHabilidades(habilidades);
  const custoTotalXP = custoTotalAtributos + custoTotalHabilidades;
  const xpRestante = xp_inicial - custoTotalXP;

  return {
    atributos: atributos,
    habilidades: habilidades,
    custoTotalAtributos: custoTotalAtributos,
    custoTotalHabilidades: custoTotalHabilidades,
    custoTotalXP: custoTotalXP,
    xpRestante: xpRestante
  };
}

function calcularCustoAtributos(atributos) {
  return Object.values(atributos).reduce((acc, val) => {
    let custo = 0;
    for (let i = 1; i <= val; i++) {
      custo += preco_atributos[i] || 0;
    }
    return acc + custo;
  }, 0);
}


function calcularCustoHabilidades(habilidades) {
  return habilidades.reduce((acc, habilidade) => {
    let custo = 0;
    const { valor, passiva, bonus } = habilidade;
    if (passiva) {
      custo = 25;  // Passiva always costs 25 XP
    } else if (bonus) {
      if (valor <= 4) {
        custo = 0;  // Bônus is free up to level 4
      } else {
        for (let i = 5; i <= valor; i++) {
          custo += preco_habilidades[i] || 0;
        }
      }
    } else {
      for (let i = 1; i <= valor; i++) {
        custo += preco_habilidades[i] || 0;
      }
    }
    return acc + custo;
  }, 0);
}

function gerarFicha(name, group, classType, age, occupation, profession, faceclaim, atributos, habilidades, characterHistory, imageLink) {
  let habilidadesHTML = '';
  habilidades.forEach(({ nome, valor, passiva, bonus }) => {
    if (passiva) {
      habilidadesHTML += `<b>${nome} —</b> passiva<br>`;
    } else if (bonus && valor <= 4) {
      habilidadesHTML += `<b>${nome} —</b> 4<br>`;
    } else {
      habilidadesHTML += `<b>${nome} —</b> ${valor}<br>`;
    }
  });

  return `[dohtml]<style>.one {width: 95%; background-color: #333;}</style>
<div id="holdapp">
<div class="holdapptop">
<div class="color"></div>
<div class="holdinsideapp"><div class="tituloapp"><strong>${name}</strong><br><br>
<div class="jarzietext">
<center> <table><tr>

<td>    
<div class="appabilities">Grupo</div>
<div class="appskillscontainer">
<div class="appskills one">${group}</div>
</div>
<p>

<div class="appabilities">Classe</div>
<div class="appskillscontainer">
<div class="appskills one">${classType}</div>
</div>
<p>

<div class="appabilities">Idade</div>
<div class="appskillscontainer">
<div class="appskills one">${age} anos</div>
</div>
<p>

<div class="appabilities">Ocupação</div>
<div class="appskillscontainer">
<div class="appskills one">${occupation}</div>
</div>
<p>

<div class="appabilities">Profissão</div>
<div class="appskillscontainer">
<div class="appskills one">${profession}</div>
</div>
<p>

<div class="appabilities">Faceclaim</div>
<div class="appskillscontainer">
<div class="appskills one">${faceclaim}</div>
</div>
</td><td><img src="${imageLink || 'https://via.placeholder.com/200x320'}" class="mad_imagem"></td>

</tr></table></center></div><p><p>

<div class="tituloapp2"><strong>História</strong></div>

<div class="jarzietext">
${characterHistory}
</div>
<p><p>
<div class="tituloapp2"><strong>Atributos</strong></div>
<div class="jarzietext"><center><table style="padding: 20px 30px;"><tr>
<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.FOR}</div><p><p> FOR </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.DES}</div><p><p> DES </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.PRE}</div><p><p> PRE </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.MEN}</div><p><p> MEN </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.ALM}</div><p><p> ALM </td>
 </tr></table>

<table><tr><td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.CON}</div><p><p> CON </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.REF}</div><p><p> REF </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.GUA}</div><p><p> GUA </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.AUR}</div><p><p> AUR </td>

<td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.BIO}</div><p><p> BIO </td>
 </tr></table>

</center></div><p><p>


<div class="tituloapp2"><strong>Habilidades</strong></div>

<div class="jarzietext">
<b>Habilidade de Grupo</b><br>
${habilidadesHTML}
</div><p><p>

</div>
</div>
</div>
[/dohtml]`;
}

